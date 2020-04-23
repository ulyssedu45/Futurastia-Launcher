const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Go est'il un bon langage ? ", function(name) {
    if(name == "non"){
        console.log("tu penses bien") 
    }
});

rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});