//Copyright (c) 2021, Ana Carolina Arellano
'use strict'

export default class Editor {
    constructor(){
        //hold level data
        this.gameObjectList = [];

        //fetch the list of levels
        this.populateLevelList();

        //fetch the list of gameobjects
        /*this.populateGameObjectList()
          .then(gameObjects => {
            //build sidebar with game objects
          });*/
          

        //initialize the draggable stuff
        
        //handle user save events
        //Set up event handler for form submit
        $("#level-form").on('submit', event => this.handleSubmitForm(event));
        
    }
    
    run(){}

    populateLevelList(){
        //post message to server
        $.post('/api/get_level_list/caro')
          .then(rawData => JSON.parse(rawData))
          .then(newLevelData => {
            this.addLevelList(newLevelData);
          }); 
    }

    addLevelList(levelNameList){
      levelNameList.forEach(level => {
        $("#level-list").append(`<option value="${level}">${level}</option>`);
      });
    }

    /*populateGameObjectList(){
      return new Promise((resolve, reject) => {
        $.post('/api/get_object_list', {type: 'object'})
              .then(theObjectList => {
                resolve(objectList)
              })
              .catch(error => {
                reject(error)
              })
      })
      
    }*/
    handleSubmitForm(event){
      console.log("ENTRE");
      event.preventDefault();
      
      //get form data as JS object
      let paramsArray = $(event.target).serializeArray();
      let body = {};
      paramsArray.forEach(element => {
        body[element.name] = element.value;
      });
      //Send data to the server...
      $.post("/api/save", body, this.handleServerResponse);
    }

    handleDraggables(){
      $('#box1')
        .on('mouseover', event => {
        //change cursor
      })
      .on('dragstart', event => {
        //get data to transfer
        let transferData = {
          targetId: event.target.id,
          gameParams: {}
        };

        //attach transfer data to the event
        event.originalEvent.dataTransfer.setData("text", JSON.stringify(transferData));
        event.originalEvent.dataTransfer.effectAllowed = "move";

        //grab offset
        this.$dragTarget = $(event.target);
        this.offset.x = event.clientX - Math.floor(event.target.offsetLeft);
        this.offset.y = event.clientY - Math.floor(event.target.offsetTop);
        //z index
        this.z = this.$dragTarget.css("zIndex");
      })
      .on('mouseout', event => {
        //change cursor back
      });

    $('#droptarget')
      .on('dragover', event => {
          event.preventDefault()

          this.$dragTarget.removeClass({
            position: "absolute",
            margin:"0px",
            left: `${event.clientX - this.offset.x}px`,
            top: `${event.clientY - this.offset.y}px`,
          })
      })
      .on('drop', event => {
        event.preventDefault();

        //get embedded transferData
        let rawData = event.originalEvent.dataTransfer.getData("text");
        let transferData = JSON.parse(ramData);

        //attach transferData.gameParams to something?

        //create a new element in the right  location
      });
    }
}
