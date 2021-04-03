//Copyright (c) 2021, Ana Carolina Arellano
'use strict'

import Path from 'path'
import HTTP from 'http'
import Express from 'express'
import FileSystem from 'fs-extra'
import fs from 'fs'
const __dirname = Path.resolve()
const PORT = 3000
import Reply from './scripts/Reply.js'

class Server {
    constructor() {

        this.title = "Angry Rabbits";
        this.api = Express();
        this.api.use(Express.json())
            .use(Express.urlencoded({ extended: true }))
            .use(Express.static(Path.join(__dirname, '.')));

        //Get home page
        this.api.get('/', (request, response) => {
            response.sendFile('./index.html', { title: 'Angry Rabbits' });
        })

        //Get editor page
        this.api.get('/', (request, response) => {
            response.sendFile('./editor.html', { title: `${this.title} Editor` });
        })

        //Returns the list of levels that are saved in the editor
        this.api.post('/api/get_level_list/:username', (request, response) => {
            let levelNameList = [];
            //Consulted page for this snippet of code: https://www.codegrepper.com/code-examples/javascript/get+names+of+all+files+inside+a+folder+node
            FileSystem.readdir("./scripts/data/", (err, files) => {
                //handling error
                if (err) {
                    return console.error(err);
                }
                //listing all files using forEach
                files.forEach(file => {
                    //consulted page to get the extension: https://dev.to/jalal246/detect-extension-in-a-directory-using-node-js-b9l
                    if (file.split(".").pop() == "json") {
                        //page consulted: https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
                        levelNameList.push(file.split('.').slice(0, -1).join('.'))
                    }
                });
                //provide option to add level with new name
                levelNameList.push("New_Level...")
                response.send(JSON.stringify(levelNameList));
            });
        });

        //save information of the level
        this.api.post('/api/save', (request, response) => {
            //retrieve body
            const body = request.body;
            //Reply
            let reply = new Reply();

            let fileName;
            //check if user chose to add a level with a new name
            if (`${body.levelOptions}` == "New_Level...") {
                //save file with specified name
                fileName = `./scripts/data/${body.newName}.json`
            }
            else {
                //name was one of the displayed options
                fileName = `./scripts/data/${body.levelOptions}.json`
            }
            //write data into file depending on the name of edited level
            FileSystem.outputJSON(fileName, body)
                .then(() => FileSystem.readJSON(fileName))
                .then(levelData => {
                    reply.payload = levelData;
                })
                .catch(err => {
                    reply.error(1, "Wrong data")
                    console.error(err);
                })
                .then(() => response.send(reply.ok().serialize()));

        });

        //save the block type that the user created
        this.api.post('/api/save_block', (request, response) => {
            //retrieve body
            const body = request.body;
            //Reply
            let reply = new Reply();

            const fileName = `./scripts/data/library/object-${body.type}.json`
            this.objectList.push(body.texture);
            //write data into file depending on the name of edited level
            FileSystem.outputJSON(fileName, body)
                .then(() => FileSystem.readJSON(fileName))
                .then(blockData => {
                    reply.payload = blockData;
                })
                .catch(err => {
                    reply.error(1, "Wrong data")
                    console.error(err);
                })
                .then(() => response.send(reply.ok().serialize()));
        });

        //Returns the list of objects saved in the editor
        this.api.post('/api/get_object_list', (request, response) => {
            let reply = new Reply();
            let fileNames = fs.readdirSync("./scripts/data/library")
            //map the file names of the objects to read them
            let filePromises = fileNames.map(fileName => {
                //turns an array of strings to promise of JSON data
                return FileSystem.readJSON(`./scripts/data/library/${fileName}`);
            })
            //Executes the array of promises, only gets resolves when array of promises is resolved
            Promise.all(filePromises)
                .then(fileData => {
                    reply.payload = fileData;
                })
                .catch(err => {
                    reply.error(1, "Wrong data")
                })
                .then(() => {
                    response.send(reply.ok().serialize())
                });

        });

        //Returns the information of a saved level
        this.api.post('/api/load', (request, response) => {
            let parameters = request.body;
            let reply = new Reply();

            let folder = "./scripts/data";
            //open some file, the name is in parameters
            FileSystem.readJSON(`${folder}/${parameters.levelOptions}.json`)
                .then(fileData => {
                    reply.payload = fileData;
                })
                .catch(err => {
                    reply.error(1, "Wrong data")
                })
                .finally(() => {
                    response.send(reply.ok().serialize());
                });
        })

        //Returns the list of available textures/images 
        this.api.post('/api/get_textures', (request, response) => {
            let texturesList = [];
            //Consulted page for this snippet of code: https://www.codegrepper.com/code-examples/javascript/get+names+of+all+files+inside+a+folder+node
            FileSystem.readdir("./images/", (err, files) => {
                //handling error
                if (err) {
                    return console.error(err);
                }
                //listing all files using forEach
                files.forEach(file => {
                    //consulted page to get the extension: https://dev.to/jalal246/detect-extension-in-a-directory-using-node-js-b9l
                    if (file.split(".").pop() == "png") {
                        //page consulted: https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
                        texturesList.push(file.split('.').slice(0, -1).join('.'))
                    }
                });
                //return list of available textures
                response.send(JSON.stringify(texturesList));
            });
        });
        //start running the project
        this.run();
    }

    //run the project and listen to the specified port
    run() {
        this.api.set('port', PORT);
        this.listener = HTTP.createServer(this.api);
        this.listener.listen(PORT);

        this.listener.on('listening', event => {
            let addr = this.listener.address();
            let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;

            console.log(`Listening on ${bind}`)
        })
    }
}
const server = new Server();