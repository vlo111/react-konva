import React, {useState} from "react";
import {Circle, Group} from "react-konva";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;
import Text from './Text'
import { IEditable } from "../../types/schema";

const Shape = ({
                   setEditable, editableText, shapeProps, ...handlers
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
                <Text
                    name={props.name}
                    x={-35}
                    y={-35}
                    width={80}
                    height={65}
                    lineHeight={1.2}
                    editableText={editableText}
                    setEditable={setEditable}
                />
            </Group>
        </React.Fragment>
    );
};

export default Shape;
