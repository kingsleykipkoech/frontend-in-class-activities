from bs4 import BeautifulSoup

# Open the HTML file you saved/pasted
with open("canvas.html", "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

# 1. Find all assignment containers
containers = soup.find_all("div", class_="ig-row")

print(f"Total assignments found: {len(containers)}\n")

# 2. Loop through each container
for container in containers:
    # Assignment Name
    title_element = container.find("a", class_="ig-title")
    title = title_element.text.strip() if title_element else "Unknown"

    # Due Date
    due_element = container.find("span", class_="assignment-date-due")
    due_date = due_element.text.strip() if due_element else "No due date"

    # Check status
    text = container.text.lower()
    if "submitted" in text:
        status = "Submitted"
    elif "missing" in text:
        status = "Missing"
    else:
        status = "Active"

    print(f"Assignment: {title}")
    print(f"Status:     {status}")
    print(f"Due Date:   {due_date}")
    print("-" * 40)
