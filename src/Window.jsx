import { useState } from 'react';
import { Rnd } from 'react-rnd';

function Window({ app, onClose, onFocus, zIndex }) {
    // On crée un état pour savoir si on est en train de bouger la fenêtre
    const [isDragging, setIsDragging] = useState(false);

    return (
        <Rnd
            default={{
                x: 100 + Math.random() * 50,
                y: 100 + Math.random() * 50,
                width: 400,
                height: 350,
            }}
            minWidth={300}
            minHeight={200}
            bounds="parent"
            style={{ zIndex: zIndex }}
            className="window"
            // --- LA MAGIE EST ICI ---
            onDragStart={() => { onFocus(); setIsDragging(true); }}
            onDragStop={() => setIsDragging(false)}
            onResizeStart={() => setIsDragging(true)}
            onResizeStop={() => setIsDragging(false)}
        // ------------------------
        >
            <div className="title-bar" onMouseDown={onFocus} style={{ cursor: 'move' }}>
                <div className="title-bar-text">{app.name} - {app.author}</div>
                <div className="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close" onClick={() => onClose(app.id)}></button>
                </div>
            </div>

            <div className="window-body" style={{ margin: 0, padding: 0, height: 'calc(100% - 30px)' }}>
                <iframe
                    src={app.entry_point}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#fff',
                        // On désactive la souris sur l'iframe pendant le mouvement !
                        pointerEvents: isDragging ? 'none' : 'auto'
                    }}
                    title={app.name}
                />
            </div>
        </Rnd>
    );
}

export default Window;