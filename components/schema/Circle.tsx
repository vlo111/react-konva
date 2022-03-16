import React from "react";
import {Circle, Group, Transformer} from "react-konva";
import Points from "./Points";
import StageUtil from "../../services/Stage";
const Circ = ({
                  shapeProps, isSelected, onSelect,
                  onChange, visiblePoints, setVisiblePoints,
                  updateLinks,
                  drawLinkStart, setDrawLinkStart, setDrawLinkEnd
              }) => {
    const shapeRef = React.useRef();

    const trRef = React.useRef();

    React.useEffect(() => {
        if (isSelected) {
            trRef.current.setNode(shapeRef.current);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const updateNodes = (e: any, id: any) => {

        updateLinks(e, id)
    }

    return (
        <React.Fragment>
            <Group
                x={0}
                y={0}
                draggable
                onMouseOver={() => {
                    if (!isSelected)
                        setVisiblePoints(shapeProps.id)
                }}
                onMouseLeave={() => {
                    setVisiblePoints('')
                }}
                onDragStart={(e) => {
                    updateNodes(e, shapeProps.id)
                }}
                onDragMove={(e) => {
                    updateNodes(e, shapeProps.id)
                }}
                // onDragEnd={() => {
                //     const node = shapeRef.current;
                //
                //     const position = StageUtil.getAbsolutePosition(node);
                //
                //     node.setAbsolutePosition(position);
                //
                //     onChange({
                //         ...shapeProps,
                //         x: position.x,
                //         y: position.y,
                //     });
                // }}
            >
                <Circle
                    onClick={onSelect}
                    ref={shapeRef}
                    {...shapeProps}
                    onTransformEnd={e => {
                        // transformer is changing scale
                        const node = shapeRef.current;
                        const scaleX = node.scaleX();
                        const scaleY = node.scaleY();
                        node.scaleX(1);
                        node.scaleY(1);
                        onChange({
                            ...shapeProps,
                            x: node.x(),
                            y: node.y(),
                            width: node.width() * scaleX,
                            height: node.height() * scaleY,
                        });
                    }}
                />
                <Points
                    circle={shapeProps}
                    visible={visiblePoints === shapeProps.id}
                    drawLinkStart={drawLinkStart}
                    setDrawLinkStart={setDrawLinkStart}
                    setDrawLinkEnd={setDrawLinkEnd}
                />
            </Group>
            {
                isSelected &&
                <Transformer
                    ref={trRef}
                    anchorStroke='#585858'
                    anchorFill='white'
                    anchorSize={15}
                    anchorCornerRadius={10}
                    rotateAnchorOffset={35}
                    borderStrokeWidth={3}
                    borderStroke='#585858'
                    borderDash={[15, 15]}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />

            }
        </React.Fragment>
    );
};
export default Circ;