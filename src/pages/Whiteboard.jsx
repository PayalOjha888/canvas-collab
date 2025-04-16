import { useState, useRef } from 'react';
import { Stage, Layer, Line, Text, Group, Rect } from 'react-konva';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Paper,
  Tooltip,
  Slider,
  Button,
} from '@mui/material';
import {
  Brush,
  Highlight,
  Create,
  Undo,
  Redo,
  Save,
  PictureAsPdf,
  Delete,
  Mic,
  MicOff,
  Palette,
  TextFields,
  StickyNote2,
} from '@mui/icons-material';
import styled from 'styled-components';

const ToolbarButton = styled(IconButton)`
  margin: 0 4px;
`;

const ColorPicker = styled.input.attrs({ type: 'color' })`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const tools = {
  PEN: 'pen',
  PENCIL: 'pencil',
  HIGHLIGHTER: 'highlighter',
  ERASER: 'eraser',
  TEXT: 'text',
  STICKY: 'sticky'
};

const Whiteboard = () => {
  const [tool, setTool] = useState(tools.PEN);
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [texts, setTexts] = useState([]);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');
  const stageRef = useRef(null);
  const textareaRef = useRef(null);

  const handleMouseDown = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    if (tool === tools.TEXT) {
      const newText = {
        x: pos.x,
        y: pos.y,
        text: 'Double click to edit',
        fontSize: 16,
        fill: color,
        id: `text-${Date.now()}`,
        isDragging: false
      };
      setTexts([...texts, newText]);
      saveToHistory();
      return;
    }

    if (tool === tools.STICKY) {
      const newSticky = {
        x: pos.x,
        y: pos.y,
        text: 'Double click to edit',
        width: 150,
        height: 150,
        fill: '#fff59d',
        id: `sticky-${Date.now()}`,
        isDragging: false
      };
      setStickyNotes([...stickyNotes, newSticky]);
      saveToHistory();
      return;
    }
    setIsDrawing(true);
    
    let strokeOpacity = 1;
    if (tool === tools.HIGHLIGHTER) {
      strokeOpacity = 0.3;
    }

    const newLine = {
      tool,
      points: [pos.x, pos.y],
      color: tool === tools.ERASER ? '#ffffff' : color,
      strokeWidth: tool === tools.ERASER ? strokeWidth * 2 : strokeWidth,
      opacity: strokeOpacity,
      tension: tool === tools.PENCIL ? 0.2 : 0.5
    };
    setLines([...lines, newLine]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    e.evt.preventDefault();

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    
    // Add points with some spacing for smoother lines
    const newPoints = lastLine.points.concat([point.x, point.y]);
    setLines([...lines.slice(0, -1), { ...lastLine, points: newPoints }]);
  };

  const handleMouseUp = (e) => {
    e.evt.preventDefault();
    setIsDrawing(false);

    const item = texts.find(t => t.isDragging) || stickyNotes.find(s => s.isDragging);
    if (item) {
      if (texts.includes(item)) {
        setTexts(texts.map(t => ({ ...t, isDragging: false })));
      } else {
        setStickyNotes(stickyNotes.map(s => ({ ...s, isDragging: false })));
      }
      saveToHistory();
    }
  };

  const handleDragStart = (e) => {
    const id = e.target.id();
    setSelectedId(id);
    if (id.startsWith('text-')) {
      setTexts(texts.map(t => ({
        ...t,
        isDragging: t.id === id
      })));
    } else if (id.startsWith('sticky-')) {
      setStickyNotes(stickyNotes.map(s => ({
        ...s,
        isDragging: s.id === id
      })));
    }
  };

  const handleDragEnd = (e) => {
    setSelectedId(null);
    saveToHistory();
  };

  const handleTextDblClick = (e, item) => {
    const stage = e.target.getStage();
    const textNode = e.target;
    const textPosition = textNode.absolutePosition();

    setIsEditing(true);
    setEditingText(item.text);
    setSelectedId(item.id);

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = item.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${textPosition.y}px`;
    textarea.style.left = `${textPosition.x}px`;
    textarea.style.width = `${textNode.width()}px`;
    textarea.style.height = `${textNode.height()}px`;
    textarea.style.fontSize = `${item.fontSize || 16}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1';
    textarea.style.fontFamily = 'sans-serif';

    textareaRef.current = textarea;
    textarea.focus();

    textarea.addEventListener('blur', () => {
      const newText = textarea.value;
      document.body.removeChild(textarea);
      setIsEditing(false);
      setSelectedId(null);

      if (item.id.startsWith('text-')) {
        setTexts(texts.map(t =>
          t.id === item.id ? { ...t, text: newText } : t
        ));
      } else if (item.id.startsWith('sticky-')) {
        setStickyNotes(stickyNotes.map(s =>
          s.id === item.id ? { ...s, text: newText } : s
        ));
      }
      saveToHistory();
    });
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setLines(history[historyStep - 1].lines);
      setTexts(history[historyStep - 1].texts);
      setStickyNotes(history[historyStep - 1].stickyNotes);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setLines(history[historyStep + 1].lines);
      setTexts(history[historyStep + 1].texts);
      setStickyNotes(history[historyStep + 1].stickyNotes);
    }
  };

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({
      lines: [...lines],
      texts: [...texts],
      stickyNotes: [...stickyNotes],
    });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleExport = (type) => {
    // TODO: Implement export functionality
  };

  const handleMicToggle = () => {
    setIsMicOn(!isMicOn);
    // TODO: Implement WebRTC voice chat
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Tooltip title="Pen">
            <ToolbarButton
              color={tool === tools.PEN ? 'secondary' : 'inherit'}
              onClick={() => setTool(tools.PEN)}
            >
              <Create />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Pencil">
            <ToolbarButton
              color={tool === tools.PENCIL ? 'secondary' : 'inherit'}
              onClick={() => setTool(tools.PENCIL)}
            >
              <Brush />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Highlighter">
            <ToolbarButton
              color={tool === tools.HIGHLIGHTER ? 'secondary' : 'inherit'}
              onClick={() => setTool(tools.HIGHLIGHTER)}
            >
              <Highlight />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Eraser">
            <ToolbarButton
              color={tool === tools.ERASER ? 'secondary' : 'inherit'}
              onClick={() => setTool(tools.ERASER)}
            >
              <Delete />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Text">
            <ToolbarButton
              color={tool === tools.TEXT ? 'secondary' : 'inherit'}
              onClick={() => setTool(tools.TEXT)}
            >
              <TextFields />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Sticky Note">
            <ToolbarButton
              color={tool === tools.STICKY ? 'secondary' : 'inherit'}
              onClick={() => setTool(tools.STICKY)}
            >
              <StickyNote2 />
            </ToolbarButton>
          </Tooltip>
          <Box sx={{ mx: 2, width: 100 }}>
            <Slider
              value={strokeWidth}
              onChange={(e, newValue) => setStrokeWidth(newValue)}
              min={1}
              max={20}
            />
          </Box>
          <Tooltip title="Color">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Palette sx={{ mr: 1 }} />
              <ColorPicker
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </Box>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Undo">
            <ToolbarButton onClick={handleUndo}>
              <Undo />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Redo">
            <ToolbarButton onClick={handleRedo}>
              <Redo />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Export as PDF">
            <ToolbarButton onClick={() => handleExport('pdf')}>
              <PictureAsPdf />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title="Export as Image">
            <ToolbarButton onClick={() => handleExport('image')}>
              <Save />
            </ToolbarButton>
          </Tooltip>
          <Tooltip title={isMicOn ? 'Turn off mic' : 'Turn on mic'}>
            <ToolbarButton onClick={handleMicToggle}>
              {isMicOn ? <MicOff /> : <Mic />}
            </ToolbarButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Stage
          width={window.innerWidth}
          height={window.innerHeight - 64}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.strokeWidth}
                tension={line.tension}
                opacity={line.opacity}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === tools.ERASER
                    ? 'destination-out'
                    : line.tool === tools.HIGHLIGHTER
                    ? 'multiply'
                    : 'source-over'
                }
              />
            ))}
          </Layer>
          <Layer>
            {texts.map((text, i) => (
              <Text
                key={i}
                id={text.id}
                x={text.x}
                y={text.y}
                text={text.text}
                fontSize={text.fontSize}
                fill={text.fill}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDblClick={(e) => handleTextDblClick(e, text)}
              />
            ))}
          </Layer>
          <Layer>
            {stickyNotes.map((sticky, i) => (
              <Group
                key={i}
                id={sticky.id}
                x={sticky.x}
                y={sticky.y}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <Rect
                  width={sticky.width}
                  height={sticky.height}
                  fill={sticky.fill}
                  shadowColor="black"
                  shadowBlur={5}
                  shadowOpacity={0.2}
                  cornerRadius={5}
                />
                <Text
                  text={sticky.text}
                  width={sticky.width - 20}
                  height={sticky.height - 20}
                  x={10}
                  y={10}
                  fontSize={14}
                  fill="#000"
                  onDblClick={(e) => handleTextDblClick(e, sticky)}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </Box>
    </Box>
  );
};

export default Whiteboard;
