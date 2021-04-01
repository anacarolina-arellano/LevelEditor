//Copyright (c) 2021, Ana Carolina Arellano
'use strict'

export default class Editor {
    constructor(){
        //hold level data
        this.gameObjectList = [];

        //fetch the list of levels
        this.populateLevelList();

        //fetch the list of gameobjects
        this.populateGameObjectList();
                  
        //handle user save events
        //Set up event handler for level form submit
        $("#level-form").on('submit', event => this.handleSubmitForm(event));

        //Set up event handler for object type form submit
        $("#blocks-form").on('submit', event => this.handleSubmitBlockForm(event));
        
    }
    
    run(){}

    //Display level list 
    populateLevelList(){
        //post message to server
        $.post('/api/get_level_list/caro')
          .then(rawData => JSON.parse(rawData))
          .then(newLevelData => {
            this.addLevelList(newLevelData);
          }); 
    }

    //add html for options (of levels)
    addLevelList(levelNameList){
      let id = 0;
      levelNameList.forEach(level => {
        $(".level-list").append(`<option id="${id}" value="${level}">${level}</option>`);
        id++;
      });

      //retrieve selected option
      $(".level-list").change(() => {
        let myText = $(".level-list").children("option:selected").val();
        if(myText == "New_Level..."){
          $("#newName").removeClass("hide");
        //  $("#level-form").prepend(`<label>Name: <input type="text" name="levelOptions"></label>`)
        }
        else{
          $("#newName").addClass("hide");
        }
      });
    }

    //Display objects available
    populateGameObjectList(){
      return new Promise((resolve, reject) => {
        $.post('/api/get_object_list', {type: 'object'})
              .then(rawData => JSON.parse(rawData))
              .then(theObjectList => {
                theObjectList.forEach(object => {
                  $("#object-library").append(`<div id="${object}" class="object-draggable ${object} draggable" draggable="true"></div>`);
                  resolve(theObjectList)
                });
                this.handleDraggables(theObjectList);
              })
              .catch(error => {
                reject(error)
              })
      })
      
    }
    
    //Get information from "info-level" form
    handleSubmitForm(event){
      event.preventDefault();
      
      //get form data as JS object
      let paramsArray = $(event.target).serializeArray();
      let body = {};
      console.log(body);
      paramsArray.forEach(element => {
        body[element.name] = element.value;
      });
      //Send data to the server...
      $.post("/api/save", body, this.handleServerResponse);
    }

    //Get information from "new-blocks" form
    handleSubmitBlockForm(event){
      event.preventDefault();
      
      //get form data as JS object
      let paramsArray = $(event.target).serializeArray();
      let body = {};
      paramsArray.forEach(element => {
        body[element.name] = element.value;
      });

      //Send data to the server...
      $.post("/api/save_block", body, this.handleServerResponse);
    }

    handleDraggables(listDraggables){
      listDraggables.forEach(object => {
        let myEl = `#${object}`;
        $(myEl).on('dragstart', event => {
          //get data to transfer
          let transferData = {
            targetId: event.target.id,
            gameParams: {
              x : event.pageX - Math.floor(event.target.offsetLeft),
              y : event.pageY- Math.floor(event.target.offsetTop)
            }
          };
         //attach transfer data to the event
          event.originalEvent.dataTransfer.setData("text", JSON.stringify(transferData));
          event.originalEvent.dataTransfer.effectAllowed = "move";
  
          //grab offset
          this.$dragTarget = $(event.target);
          //z index
          //this.z = this.$dragTarget.css("zIndex");
          
      });        
    });

    $('#droptarget')
      .on('dragover', event => {
          event.preventDefault()
      })
      .on('drop', event => {
       // event.preventDefault();
        
        //get embedded transferData
        let rawData = event.originalEvent.dataTransfer.getData("text");
        let i = 0;
        let transferData = JSON.parse(rawData);
        var myBackground = $("#droptarget");
        myBackground.append(`<div id="${transferData.targetId}-${i}" class="${transferData.targetId}"></div>`)
        $(`#${transferData.targetId}`).css('position', "absolute");
        $(`#${transferData.targetId}`).css('width', "30%");
        $(`#${transferData.targetId}`).css('left', event.pageX - transferData.gameParams.x + "px");
        $(`#${transferData.targetId}`).css('top', event.pageY - transferData.gameParams.y + "px");
        i++;
        //create a new element in the right  location
      });
  }

}
