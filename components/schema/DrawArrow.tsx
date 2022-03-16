import {Arrow, Group} from "react-konva";
import React from "react";
import Konva from "konva";

type Coordinates = {
    start: {
        x: number,
        y: number
    },
    end: {
        x: number,
        y: number
    }
}

const Edge = ({ start, end }: Coordinates) => {

    return (
        <>
            <Group>
                <Arrow
                    points={[start.x, start.y, end.x, end.y]}
                    stroke='red'
                    strokeWidth={4}
                    fill={Konva.Util.getRandomColor()}
                />
            </Group>
        </>
    );
}

export default Edge;
