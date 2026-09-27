const person = {
    name: "John",
    age: 30,
    greet: function () {
        console.log("Hello, my name is " + this.name);
    }
}
person.greet()  


// function person(name, age) {
//     this.name = name
//     this.age = age
//     this.greet = function () {
//         console.log("Hi , I  am" + { this.name });
//     };
// }
// const person1 = new person("John", 30)
// const person2 = new person("Jane", 25)

// person1.greet()