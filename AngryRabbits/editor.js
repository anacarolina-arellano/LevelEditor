//Copyright (c) 2021, Ana Carolina Arellano
'use strict'

import Editor from './scripts/Editor.js';

//main
(function Main() {
    $(document).ready(event => {
        const app = new Editor();
        app.run();
    })
})()