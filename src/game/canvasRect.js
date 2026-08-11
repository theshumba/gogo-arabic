export function subscribeToCanvasRect(game, onCanvasRectChange, win = window) {
  const reportCanvasRect = () => {
    const canvas = game.canvas;
    if (canvas && onCanvasRectChange) {
      onCanvasRectChange(canvas.getBoundingClientRect());
    }
  };

  const scheduleCanvasRectReport = () => {
    if (win.requestAnimationFrame) {
      win.requestAnimationFrame(reportCanvasRect);
    } else {
      reportCanvasRect();
    }
  };
  const handleWindowResize = () => {
    const refreshScale = () => {
      game.scale.refresh();
      scheduleCanvasRectReport();
    };
    if (win.requestAnimationFrame) {
      win.requestAnimationFrame(() => win.requestAnimationFrame(refreshScale));
    } else {
      refreshScale();
    }
  };

  game.scale.on('resize', scheduleCanvasRectReport);
  win.addEventListener('resize', handleWindowResize);
  scheduleCanvasRectReport();

  return () => {
    game.scale.off('resize', scheduleCanvasRectReport);
    win.removeEventListener('resize', handleWindowResize);
  };
}
