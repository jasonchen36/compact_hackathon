$(function(){
  // reference: http://scratchpad.io/scripts/scratchpad.js?v=4

  // Introduction
  // ===========================================================================
  var intro = ['<style>',
  '  body {',
  '  padding-top: 80px;',
  '  text-align: center;',
  '  font-family: monaco, monospace;',
  '  background: url(http://media.giphy.com/media/Jrd9E2kuPuOYM/giphy.gif) 50%;',
  '  background-size: cover;',
  '}',
  'h1, h2 {',
  '  display: inline-block;',
  '  background: #fff;',
  '}',
  'h1 {',
    '  font-size: 30px',
  '}',
  'h2 {',
  '  font-size: 20px;',
  '}',
  'span {',
  '  background: #fd0;',
  '}',
  '</style>',
  '<h1>Welcome to <span>codekast.io</span></h1><br>',
  '<h2>(a realtime html + css editor)</h2>'].join('\n');

  // Set up Ace editor
  // ===========================================================================
  window.editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/html");
  editor.setHighlightActiveLine(false);
  editor.getSession().setTabSize(2);
  var Emmet = require("ace/ext/emmet"); // important to trigger script execution
  editor.setOption("enableEmmet", true);
  document.getElementById('editor').style.fontSize='14px';
  editor.commands.removeCommand('gotoline');
  editor.setShowPrintMargin(false);
  editor.$blockScrolling = Infinity;

  // student's view, so disable editing
  editor.container.style.pointerEvents="none";
  editor.renderer.setStyle("disabled", true);

  // Set up iframe
  var iframe = document.getElementById('content'),
      iframedoc = iframe.contentDocument || iframe.contentWindow.document;
  iframedoc.body.setAttribute('tabindex', 0);

  // Socket.io references
  // ===========================================================================
  //var socket = io.connect();
  // var socket = io('http://localhost:3000/classroom');
  var socket = io('http://codekast.io/classroom');

  // connected to server
  socket.on('connected', function() {
    console.log('connected');
    // change updatedAt in server upon connect?
    socket.emit('loadClass', CodeKast.class_id);
  });

  // set editor's text
  socket.on('loadedClass', function(data) {
    console.log('loadedClass');

    document.title = CodeKast.class_name;
    $('#title').text(CodeKast.class_name);

    if (data === null) {
      editor.setValue(intro);
    } else {
      editor.setValue(data); // html data stored on server
    }

    iframedoc.body.innerHTML = editor.getValue();

    // Clear selection
    editor.clearSelection();
  });

  socket.on('name_changed', function(data) {
    document.title = data;
    $('#title').text(data);
  });

  socket.on('content_changed', function(data) {
    editor.setValue(data);
    editor.clearSelection();

    iframedoc.body.innerHTML = editor.getValue();
  });
});