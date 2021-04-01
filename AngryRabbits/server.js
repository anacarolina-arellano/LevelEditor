//Copyright (c) 2021, Ana Carolina Arellano
'use strict'

import Path from 'path'
import HTTP from 'http'
import Express from 'express'
import FileSystem from 'fs-extra'
const __dirname = Path.resolve()
const PORT = 3000
import Reply from './scripts/Reply.js'

class Server {
    constructor(){

        this.title = "Angry Rabbits";
        this.api = Express();
        this.api.use(Express.json())
                .use(Express.urlencoded({extended: false}))
                .use(Express.static(Path.join(__dirname, '.')));

        this.objectList = ['largeBoxO', 'smallBoxO', 'rabbitO', 'cannonO'];
        //Get home page
        this.api.get('/', (request, response) => {
            response.sendFile('./index.html', {title: 'Angry Rabbits'});
        })

        //Get editor page
        this.api.get('/', (request, response) => {
            //let indexFile = `${Path.join(__dirname, './')}editor.html`;
            //response.sendFile(indexFile, {title:`${this.title}Editor`});
            response.sendFile('./editor.html', {title:`${this.title} Editor`});
        })

        this.api.post('/api/get_level_list/:username', (request, response) => {
            let levelNameList = ['Level_1', 'Level_2', 'Level_3', 'New_Level...'];
            response.send(JSON.stringify(levelNameList));
        });

        this.api.post('/api/save', (request, response) => {
            //retrieve body
            const body = request.body;
            //Reply
            let reply = new Reply();

            const fileName = `./scripts/data/${body.levelOptions}.json`
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

        this.api.post('/api/save_block', (request, response) => {
            //retrieve body
            const body = request.body;
            //Reply
            let reply = new Reply();

            const fileName = `./scripts/data/library/object-${body.type}.json`
            this.objectList.push(body.name);
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

        this.api.post('/api/get_object_list', (request, response) => {
            response.send(JSON.stringify(this.objectList));
        });
        
        this.api.post('/api/load', (request, response) => {
            let parameters = request.body;
            let reply = new Reply();

            let folder = "./data";
            if(parameters.type == "object"){
                folder += "/library";
            }

            //open some file, the name is in parameters
            FileSystem.readFile(`${folder}/${parameters.type}.json`, 'utf8')
            .then(fileData => {
                reply.payload = fileData;
            })
            .catch(err => {
                reply.error(1, "Wrong data")
            });

            response.send(reply.ok().serialize());
        })

        this.run();
    }

    run(){
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