import os
import json
import time
import re
from selenium import webdriver
from selenium.webdriver.common.by import By

options = webdriver.ChromeOptions()
profile_path = os.path.expanduser("~/.canvas_scraper_profile")
options.add_argument(f"--user-data-dir={profile_path}")

driver = webdriver.Chrome(options=options)
driver.maximize_window()

try:
    url = "https://alueducation.instructure.com/courses/3130/assignments"
    driver.get(url)

    input("Log in if needed, then press Enter to start scraping: ")
    time.sleep(2)

    # Collect unique assignment links
    assignment_links = []
    for a in driver.find_elements(By.TAG_NAME, "a"):
        href = a.get_attribute("href")
        if href and re.search(r"/courses/3130/assignments/\d+", href):
            clean_url = href.split("?")[0]
            if clean_url not in assignment_links:
                assignment_links.append(clean_url)

    print(f"Found {len(assignment_links)} assignments.\n")

    results = []

    # Visit each assignment to get the details
    for i, link in enumerate(assignment_links, 1):
        print(f"[{i}/{len(assignment_links)}] Checking: {link}")
        driver.get(link)
        time.sleep(1.5)

        # Get title
        try:
            title = driver.find_element(By.CSS_SELECTOR, "h1.title, h1").text.strip()
        except:
            title = "Unknown"

        # Get page text to check due date and status
        body_text = driver.find_element(By.TAG_NAME, "body").text

        # Due date
        due_match = re.search(r"Due\s+([A-Za-z]{3}\s+\d+\s+(?:at|by)\s+\d+:\d+[ap]m)", body_text)
        due_date = due_match.group(1) if due_match else "No due date"

        # Submission status
        if "Submitted!" in body_text:
            sub_date = re.search(r"Submitted!\s*([A-Za-z]{3}\s+\d+\s+at\s+\d+:\d+[ap]m)", body_text)
            status = f"Submitted ({sub_date.group(1)})" if sub_date else "Submitted"
        elif "locked" in body_text.lower() and "submitted" not in body_text.lower():
            status = "Locked / Not Submitted"
        else:
            status = "Not Submitted"

        # Categorize
        category = "Reading / Resource" if "read and watch" in title.lower() else "Assignment"

        item = {
            "title": title,
            "category": category,
            "status": status,
            "due_date": due_date,
            "url": link
        }
        results.append(item)

        print(f"  Title:    {title}")
        print(f"  Category: {category}")
        print(f"  Status:   {status}")
        print(f"  Due date: {due_date}")
        print("-" * 40)

    # Save to JSON
    with open("assignments.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    # Separate readings from actual tasks
    actual_tasks = [a for a in results if a["category"] == "Assignment"]
    reading_tasks = [a for a in results if a["category"] == "Reading / Resource"]

    print("\n" + "=" * 50)
    print("ASSIGNMENTS & QUIZZES")
    print("=" * 50)
    for a in actual_tasks:
        print(f"• {a['title']}")
        print(f"  Status: {a['status']} | Due: {a['due_date']}")

    print("\n" + "=" * 50)
    print("READING & STUDY RESOURCES")
    print("=" * 50)
    for r in reading_tasks:
        print(f"• {r['title']}")

    pending_tasks = [a for a in actual_tasks if "Not Submitted" in a["status"]]
    submitted_tasks = [a for a in actual_tasks if "Submitted" in a["status"]]
    print("\n" + "-" * 50)
    print(f"Actionable Tasks: {len(submitted_tasks)} completed, {len(pending_tasks)} still to do.")
    print("-" * 50)

    input("\nPress Enter to exit...")

finally:
    driver.quit()
