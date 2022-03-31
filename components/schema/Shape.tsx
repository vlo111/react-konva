import React, {useState} from "react";
import {Circle, Group} from "react-konva";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;

const Shape = ({
                  shapeProps, ...handlers
              }: any) => {

    const shapeRef = React.useRef<any>();

    const props = (({ x, y, ...p }) => p)(shapeProps)

    return (
        <React.Fragment>
            <Group
                x={shapeProps.x}
                y={shapeProps.y}
                {...handlers}
                onDragEnd={() => {
                    const {x, y} = shapeRef.current.absolutePosition();
                    handlers.onDragEnd({
                        ...shapeProps,
                        x,
                        y
                    })
                }}
                onDragMove={(event: KonvaEventObject<DragEvent>) => {

                    const {x, y} = shapeRef.current.absolutePosition();

                    handlers.onDragMove(shapeProps.id, {x, y})
                }}
            >
                <Circle
                    {...props}
                    ref={shapeRef}
                    name="circle"
                    fill="white"
                    stroke={props.strokeOver ?? props.stroke}
                />
            </Group>
        </React.Fragment>
    );
};

export default Shape;
