//Copyright (c) 2021, Ana Carolina Arellano
'use strict'

export default class Editor {
  constructor() {
    //hold level data
    this.gameObjectList = [];

    //fetch the list of levels
    this.populateLevelList();

    //fetch the list of gameobjects
    this.populateGameObjectList();

    //fetch the list of textures
    this.populateTexturesList();

    //array of elements added
    this.levelElements = {};

    //id of elements added to the background
    this.id = 0;
    //handle user save events
    //Set up event handler for level form submit
    $("#level-form").on('submit', event => this.handleSubmitForm(event));

    //Set up event handler for object type form submit
    $("#blocks-form").on('submit', event => this.handleSubmitBlockForm(event));

    //Set up event handler for load type form submit
    $("#load-form").on('submit', event => this.handleSubmitLoad(event));
  }

  run() { }

  //Display level list 
  populateLevelList() {
    //post message to server
    $.post('/api/get_level_list/caro')
      .then(rawData => JSON.parse(rawData))
      .then(newLevelData => {
        this.addLevelList(newLevelData);
      });
  }

  //add html for options (of levels)
  addLevelList(levelNameList) {
    let id = 0;
    levelNameList.forEach(level => {
      $(".level-list").append(`<option id="${id}" value="${level}">${level}</option>`);
      id++;
    });

    //retrieve selected option
    $(".level-list").change(() => {
      let myText = $(".level-list").children("option:selected").val();
      if (myText != "New_Level...") {
        $("#newName").addClass("hide");
      }
      else{
        $("#newName").removeClass("hide");
      }
    });
  }

  //Display objects available
  populateGameObjectList() {
    return new Promise((resolve, reject) => {
      $.post('/api/get_object_list', { type: 'object' })
        .then(rawData => JSON.parse(rawData))
        .then(response => {
          var theObjectList = response.payload;
          theObjectList.forEach(object => {
            $("#object-library").append(`<div id="${object.texture}" class="object-draggable ${object.texture} draggable" draggable="true"></div>`);
            resolve(theObjectList)
          });
          this.handleDraggables(theObjectList);
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  //Display textures list 
  populateTexturesList() {
    //post message to server
    $.post('/api/get_textures')
      .then(rawData => JSON.parse(rawData))
      .then(newTextureData => {
        this.addTexturesList(newTextureData);
      });
  }

  //add html for options (of textures)
  addTexturesList(texturesList) {
    let id = 0;
    texturesList.forEach(texture => {
      $(".texture-list").append(`<option id="${id}" value="${texture}">${texture}</option>`);
      id++;
    });
  }

  //Get information from "info-level" form
  handleSubmitForm(event) {
    event.preventDefault();

    //get form data as JS object
    let paramsArray = $(event.target).serializeArray();
    let body = {};
    paramsArray.forEach(element => {
      body[element.name] = element.value;
    });

    body["entityLists"] = this.levelElements;
    body["id"] = this.id;
    //Send data to the server...
    $.post("/api/save", body, this.handleServerResponse);
  }

  //alert on successful response
  handleServerResponse() {
    alert("Data was saved successfully");
    window.location.reload();
  }

  //Get information from "new-blocks" form
  handleSubmitBlockForm(event) {
    event.preventDefault();

    //get form data as JS object
    let paramsArray = $(event.target).serializeArray();
    let body = {};
    paramsArray.forEach(element => {
      body[element.name] = element.value;
    });

    //Send data to the server...
    $.post("/api/save_block", body, this.handleServerResponseBlock);
  }

  //alert on successful response
  handleServerResponseBlock() {
    alert("Data was saved successfully");
    window.location.reload();
  }

  //handle draggables in editor
  handleDraggables(listDraggables) {
    listDraggables.forEach(object => {
      let myEl = `#${object.texture}`;
      $(myEl).on('dragstart', event => {
        //get data to transfer
        let transferData = {
          targetId: event.target.id,
          entity: object,
          gameParams: {
            x: event.pageX - Math.floor(event.target.offsetLeft),
            y: event.pageY - Math.floor(event.target.offsetTop)
          }
        };
        //attach transfer data to the event
        event.originalEvent.dataTransfer.setData("text", JSON.stringify(transferData));
        event.originalEvent.dataTransfer.effectAllowed = "move";
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
        let transferData = JSON.parse(rawData);
        var myBackground = $("#droptarget");
        var element = $(`#${transferData.targetId}`)

        //create a new element in the right  location
        var myClone = element.clone().prop("id", `${transferData.targetId}-${this.id}`)
        myClone.appendTo(myBackground);
        myClone.css('position', "absolute");
        myClone.css('width', "30%");
        myClone.css('left', event.pageX - transferData.gameParams.x + "px");
        myClone.css('top', event.pageY - transferData.gameParams.y + "px");

        //delete clones
        myClone.on('contextmenu', event => {
          event.preventDefault()
          var deletedEl = $(event.target);
          delete this.levelElements[`${event.target.id}`]
          deletedEl.remove();
        })

        //save element into array
        this.levelElements[`${transferData.targetId}-${this.id}`] = {
          id: `${transferData.targetId}-${this.id}`,
          pos: { "x": event.pageX - transferData.gameParams.x, "y": event.pageY - transferData.gameParams.y },
          entity: transferData.entity
        }
        this.id++;
      });
  }

  //handle load option
  handleSubmitLoad(event) {
    event.preventDefault();

    //get form data as JS object
    let paramsArray = $(event.target).serializeArray();
    let body = {};
    paramsArray.forEach(element => {
      body[element.name] = element.value;
    });
    //Send request to the server...
    $.post("/api/load", body, (response) => this.handleLoadResponse(response));
  }

  //set loaded data
  handleLoadResponse(response) {
    //get data from the response 
    const newData = JSON.parse(response);
    const levelData = newData.payload
    const myBackground = $("#droptarget");
    
    //the level already has a name, so hide the div of new name
    $("#newName").addClass("hide");

    //set level data saved into "level-form"
    const myForm = $("#level-form");
    myForm[0].levelOptions.value = levelData.levelOptions;
    myForm[0].obstacles.value = levelData.obstacles;
    myForm[0].numShot.value = levelData.numShot;
    myForm[0].oneScore.value = levelData.oneScore;
    myForm[0].twoScore.value = levelData.twoScore;
    myForm[0].threeScore.value = levelData.threeScore;

    //set placed elements into background area
    this.levelElements = levelData.entityLists
    this.id = parseInt(levelData.id)
    const levelElements = Object.values(this.levelElements)
    levelElements.forEach(el => {
      var element = $(`#${el.entity.texture}`)

      //create a new element in the right  location
      var myClone = element.clone().prop("id", `${el.id}`)
      myClone.appendTo(myBackground);
      myClone.css('position', "absolute");
      myClone.css('width', "30%");
      myClone.css('left', el.pos.x + "px");
      myClone.css('top', el.pos.y + "px");

      //delete clones
      myClone.on('contextmenu', event => {
        event.preventDefault()
        var deletedEl = $(event.target);
        delete this.levelElements[`${event.target.id}`]
        deletedEl.remove();
      })
    })
  }
}
