import {Arrow, Group, Path, TextPath} from "react-konva";
import React, {useRef, useState} from "react";
import {Html} from "react-konva-utils";

type EdgeType = {
    arrow: {
        source: {
            x: number,
            y: number
        },
        target: {
            x: number,
            y: number
        },
        stroke: string,
    }
    dash?: [number, number]
}

const distance = ([x1, y1], [x2, y2]) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

const Edge = ({...props}: EdgeType) => {

    let {arrow: {source, target, stroke, same, itself}, dash = [0, 0]} = props;

    const data = {
        points: [
            source.x, source.y,
            target.x, target.y
        ],
        stroke: stroke,
        dash: dash
    }

    let arc = 0;
    let arcDirection = 0;

    if (same) {
        const dr = distance([target.x, target.y], [source.x, source.y]);

        arc = same.arc * dr;
        arcDirection = same.arcDirection;
    }

    return (
        <>
            <Group>
                {!itself ?
                    (!same ?
                        <Arrow
                            strokeWidth={2}
                            {...data}
                        /> :
                        <Path
                            data={`
                            M${source.x},${source.y}
                            A${arc},${arc} 0 0,${arcDirection}
                            ${target.x},${target.y}`}
                            stroke={stroke}
                            dash={dash}
                        />) :
                    <Path
                        data={`
                        M${itself.startX},${itself.startY}
                        A ${80 + (itself.count * 25)} ${80 + (itself.count * 25)} 0 1 1
                        ${itself.endX},${itself.startY}`}
                        stroke={stroke}
                        dash={dash}
                    />}
                {/*<path d="M100,100 L4,2 0,4" />*/}
                {/*<Path*/}
                {/*    data={`M${source.x},${source.y}*/}
                {/*        A${arc},${arc} 0 0,${arcDirection}*/}
                {/*        ${target.x},${target.y}`}*/}
                {/*    stroke={stroke}*/}
                {/*    dash={dash}*/}
                {/*/>*/}
                {/*<TextPath*/}
                {/*    fill={data.stroke}*/}
                {/*    fontSize={'24'}*/}
                {/*    fontFamily={'Arial'}*/}
                {/*    align='center'*/}
                {/*    text={'Textpath - literally text on a path'}*/}
                {/*    data={`*/}
                {/*        M${itself.startX},${itself.startY}*/}
                {/*        A ${80 + (itself.count * 25)} ${80 + (itself.count * 25)} 0 1 1*/}
                {/*        ${itself.endX},${itself.startY}`}*/}
                {/*    textBaseline={'bottom'}*/}
                {/*    draggable*/}
                {/*/>*/}
                {/*<TextPath*/}
                {/*    fill={'red'}*/}
                {/*    fontSize={'24'}*/}
                {/*    fontFamily={'Arial'}*/}
                {/*    align='center'*/}
                {/*    text="test Textpath - literally text on a path Textpath - literally text on a path"*/}
                {/*    lineCap={'butt'}*/}
                {/*    data={`M${source.x},${source.y}*/}
                {/*    ${target.x},${target.y}`}*/}
                {/*    onClick={()=> {*/}
                {/*    } }*/}
                {/*    textBaseline={'bottom'}*/}
                {/*    draggable*/}
                {/*/>*/}
            </Group>
        </>
    );
}

export default Edge;
