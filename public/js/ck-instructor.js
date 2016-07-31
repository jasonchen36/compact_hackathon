$(function(){
  // reference: http://scratchpad.io/scripts/scratchpad.js?v=4
  // dependencies: ace, ext-emmet, emmet, underscore.js, key, socketio

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

  // Set up iframe.
  // ===========================================================================
  var iframe = document.getElementById('preview'),
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

    $('#title').text(CodeKast.class_name);
    document.title = CodeKast.class_name;

    if (data === null) {
      editor.setValue(intro);
    } else {
      editor.setValue(data); // html data stored on server
    }

    // Clear selection
    editor.clearSelection();
  });

  // TODO: show number of viewers
  //TODO: Add a method that when new students join, populate the student list.

  // Code Editing
  // ===========================================================================

  // On data change, re-render the code in the iframe and emit code changes
  editor.getSession().on('change', function(e) {
    socket.emit('content_changed',  { class_id: CodeKast.class_id, code: editor.getValue() });

    iframedoc.body.innerHTML = editor.getValue();
    // Resize the menu icon if appropriate
    var linesOfCode = editor.session.getLength();
    if (linesOfCode < 10) {
      $('#menu').attr('class', 'small');
    } else if ( linesOfCode > 9 && linesOfCode < 99) {
      $('#menu').attr('class', 'medium');
    } else if ( linesOfCode > 99 && linesOfCode < 999) {
      $('#menu').attr('class', 'large');
    } else if (linesOfCode > 999){
      $('#menu').attr('class', 'x-large');
    }
  });

  // Filename Stuff
  //----------------------------------------------------------------------------

  // Let users update title when they click it
  $('#title').click(function(){
    var newTitle = prompt('What do you want to name your class?', $(this).text());
    if (newTitle != null) {
      socket.emit('changeName', { class_id: CodeKast.class_id, newName: newTitle });
      $('#title').text(newTitle);
      document.title = newTitle;
    }
  });

  // (webkit only?) hover bug fix
  $('#title').hover(function(){$(this).addClass('hover')}, function(){$(this).removeClass('hover')});

  // Menu stuff
  //----------------------------------------------------------------------------

  // Toggle fullscreen mode on menu click
  $('#menu').click(function(){
    $('#codekast').toggleClass('menu');
  })

  // Drag to resize
  //----------------------------------------------------------------------------

  var clicking = false;
  $('#drag-handle').mousedown( function() {
    clicking = true;
    $(this).addClass('dragging');
  });

  $(window).mouseup( function() {
    $('#drag-handle').removeClass('dragging');
    $('body').removeClass('resizing');
    clicking = false;
  });

  $(window).mousemove( function(e) {
    if (clicking === true) {
      editor.resize();
      $('body').addClass('resizing');
      $('#preview').css('right', '0px');
      $('#preview').css('width', window.innerWidth - e.pageX);
      $('#preview').css('left', e.pageX + 'px');
      $('#drag-handle').css('left', (e.pageX - 5) + 'px');
      $('#commandbar, #editor, #footer').css('right', window.innerWidth - e.pageX);
    }
  });

});