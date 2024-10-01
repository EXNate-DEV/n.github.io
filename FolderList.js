const fs = require("fs")
const path = require("path")

const {
    glob,
    globSync,
    globStream,
    globStreamSync,
    Glob,
  } = require('glob')  

let s = globSync('**/**', {
    ignore: [
        ".git",
        ".git/**",
        "node_modules",
        "node_modules/**",
        "assets/file_listings.json"
    ],
    posix: true,
})

fs.writeFileSync(path.join(__dirname, "assets\\file_listings.json"), JSON.stringify({
    data: s
}));

console.log(__dirname);