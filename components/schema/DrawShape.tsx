import type {NextPage} from 'next'
import { Circle } from "react-konva";
import React from "react";

const DrawShape: NextPage<any> = ({ drawShape }: any) => {
    return (
        <Circle
            key={`drawShape${drawShape.id}`}
            x={drawShape.x}
            y={drawShape.y}
            stroke={drawShape.color}
            strokeWidth={2}
            radius={50}
            opacity={0.8}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            shadowColor="black"
            shadowBlur={5}
            shadowOpacity={0.4}
            rotation={drawShape.rotation}
        />
    )
}

export default DrawShape
