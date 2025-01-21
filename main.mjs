import options from "./options.mjs";
import {program} from "commander";
import * as fs from "fs/promises";
import path from 'path';
import { fileURLToPath } from 'url';
import * as ps from "./js/Security/Node/PolarSecurity.js";
import JavaScriptObfuscator from "javascript-obfuscator";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

program
    .option("-d, --dist", "Build for distribution.")
    .option("-o, --obfuscate", "Obfuscate all javascript code.")
    .parse();

const opts = program.opts();

if (opts.dist) {
    console.log("Copying folder..")
    await fs.cp(__dirname, path.join(__dirname, "..", "dist"), {
        recursive: true
    });
    console.log("Copied to ../dist");
    for await (const entry of fs.glob("**/*.@(html|js)", {
        cwd: path.join(__dirname, "..", "dist")
    })) {
        if (entry.startsWith("node_modules") || options.exclusions.includes("/"+entry)) {
            continue;
        }
        if (entry.endsWith(".js") && opts.obfuscate) {
            console.log(`Obfuscating file: ${entry}`);
            let buffer = await fs.readFile(path.join(__dirname, "..", "dist", entry), "utf-8");
            buffer = JavaScriptObfuscator.obfuscate(buffer, {selfDefending: true, deadCodeInjection: true, deadCodeInjectionThreshold: 1});
            await fs.writeFile(path.join(__dirname, "..", "dist", entry), buffer.getObfuscatedCode());
        }
        if (entry.endsWith(".html")) {
            console.log(`Encoding file: ${entry}`);
            let buffer = await fs.readFile(path.join(__dirname, "..", "dist", entry));
            buffer = ps.file_encode(buffer);
            await fs.writeFile(path.join(__dirname, "..", "dist", entry), buffer);
        }
    }
    console.log("Encoded all files.");
}