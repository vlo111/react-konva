import type {NextPage} from 'next'
import {Arrow, Group, Layer, Stage, Circle} from "react-konva";
import Konva from "konva";
import {useEffect, useRef, useState} from "react";
import CircleComponent from "./Circle";
import Points from "./Points";
import ToolBar from './tool-bar'
import styles from '../../styles/Home.module.scss'
import StageUtil from "../../services/Stage";
import DrawArrow from "./DrawArrow";
import {Html} from "react-konva-utils";

import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';
import Draggable from 'react-draggable';

const DraggableBox = ({box}) => {
    const updateXarrow = useXarrow();
    console.log(box.id, 'render');
    return (
        <Draggable
            onDrag={updateXarrow}
            onStop={updateXarrow}
            defaultPosition={{x: box.x, y: box.y}}
        >
            <div
                id={box.id}
                style={{
                    width: "50px",
                    height: "50px",
                    borderStyle: 'solid',
                    borderWidth: '0 50px 50px 50px',
                    borderColor: 'transparent transparent #007bff transparent'
                }}
            >
            </div>
        </Draggable>
    );
};

const Schema: NextPage = ({nodes, links}: any) => {

    const [circles, setCircles] = useState(nodes);

    const [edges, setEdges] = useState(links);

    const [selectedId, selectShape] = useState(null);

    const [visiblePoints, setVisiblePoints] = useState('');

    const addCircle = (circle: any) => {
        const circ = {
            x: circle.x,
            y: circle.y,
            width: 100,
            height: 100,
            fill: circle.color,
            id: `circ${circles.length + 1}`,
        };
        const circs = circles.concat([circ]);
        setCircles(circs);
    };

    const [orientedShape, setOrientedShape] = useState({
        x: 0,
        y: 0,
        id: 'fake_node',
        rotation: Math.random() * 180,
        start: false
    });

    const getPosition = (l: any) => {
        let x, y, x1, y1;

        if (l.source.place === 0) {
            x = l.source.x - 50
            y = l.source.y;
        } else if (l.source.place === 1) {
            x = l.source.x
            y = l.source.y - 50;
        } else if (l.source.place === 2) {
            x = l.source.x + 50
            y = l.source.y;
        } else if (l.source.place === 3) {
            x = l.source.x;
            y = l.source.y + 50;
        }

        if (l.target.place === 0) {
            x1 = l.target.x - 50
            y1 = l.target.y;
        } else if (l.target.place === 1) {
            x1 = l.target.x
            y1 = l.target.y - 50;
        } else if (l.target.place === 2) {
            x1 = l.target.x + 50
            y1 = l.target.y;
        } else if (l.target.place === 3) {
            x1 = l.target.x;
            y1 = l.target.y + 50;
        }

        return {x, y, x1, y1}
    }

    const updateLinks = (event: any, id: any) => {
        const changeLinks = edges.length ? [].concat(edges) : [].concat(links);

        const {currentTarget: target} = event;

        const position = StageUtil.getAbsolutePosition(target);

        changeLinks.forEach((l: any) => {
            if (l.source.id === id) {
                l.source.x = position.x;
                l.source.y = position.y;
            }

            if (l.target.id === id) {
                l.target.x = position.x;
                l.target.y = position.y;
            }
        })

        setEdges(changeLinks)
    }

    const [drawLinkStart, setDrawLinkStart] = useState(null);
    const [drawLinkMove, setDrawLinkMove] = useState(null);
    const [drawLinkEnd, setDrawLinkEnd] = useState(null);

    const boxes = [
        {id: 'box1', x: 800, y: 400, reference: useRef(null)},
        {id: 'box2', x: 350, y: 80, reference: useRef(null)},
        {id: 'box3', x: 350, y: 80, reference: useRef(null)},
        {id: 'box4', x: 350, y: 80, reference: useRef(null)},
        {id: 'box5', x: 450, y: 180, reference: useRef(null)},
    ];

    const [lines] = useState([
        {
            start: 'box3',
            end: 'box1',
            labels: {
                middle: (
                    <div
                        contentEditable
                        suppressContentEditableWarning={true}
                        style={{
                            font: 'italic 1.5em serif',
                            color: 'purple',
                            border: '1px solid ' + Konva.Util.getRandomColor()
                        }}>
                        Volodya label
                    </div>
                ),
            },
            color: 'rgb(45, 198, 162)',
            path: 'grid',
            // endAnchor: ["right", {position: "left", offset: {y: -10}}],
        },
        {
            start: 'box2',
            end: 'box1',
            labels: {
                middle: (
                    <div
                        contentEditable
                        suppressContentEditableWarning={true}
                        style={{
                            font: 'italic 1.5em serif',
                            color: 'purple',
                            border: '1px solid ' + Konva.Util.getRandomColor()
                        }}>
                        Karen labelw
                    </div>
                ),
            },
            color: 'rgb(45,144,198)',
            path: 'Arrow',
            // endAnchor: ["right", {position: "left", offset: {y: -10}}],
        },
        {
            start: 'box4',
            end: 'box5',
            labels: {
                middle: (
                    <div
                        contentEditable
                        suppressContentEditableWarning={true}
                        style={{
                            font: 'italic 1.5em serif',
                            color: 'purple',
                            border: '1px solid ' + Konva.Util.getRandomColor()
                        }}>
                        Volodya labelw
                    </div>
                ),
            },
            color: 'rgb(197,31,224)',
            path: 'straight',
            headShape: 'arrow',
            // endAnchor: ["right", {position: "left", offset: {y: -10}}],
        }
    ]);


    return (
        <div className={styles.width}>
            <ToolBar setOrientedShape={setOrientedShape} orientedShape={orientedShape}/>
            <Stage
                x={0}
                y={0}
                style={{border: '1px solid red'}}
                width={window.innerWidth - 100}
                height={window.innerHeight - 100}
                draggable
                onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {

                    // create node
                    if (orientedShape.start) {
                        setOrientedShape({
                            ...orientedShape,
                            start: false,
                        })

                        addCircle({
                            id: `node_${Math.floor(Math.random() * Math.floor(10000))}`,
                            name: `node_${Math.floor(Math.random() * Math.floor(10000))}`,
                            x: orientedShape.x,
                            y: orientedShape.y,
                            rotation: orientedShape.rotation,
                            color: orientedShape.color,
                        });
                        document.body.style.cursor = 'auto';
                    }

                    // draw link
                    if (e.target.name() !== 'circleControl') {
                        setDrawLinkStart(null)
                    } else {
                        if (drawLinkEnd) {
                            const {circle: source, place: sourcePlace} = drawLinkStart;
                            const {circle: target, place: targetPlace} = drawLinkEnd;

                            const addLink = [{
                                source: {
                                    id: source.id,
                                    x: source.x,
                                    y: source.y,
                                    place: sourcePlace
                                },
                                target: {
                                    id: target.id,
                                    x: target.x,
                                    y: target.y,
                                    place: targetPlace
                                },
                                color: Konva.Util.getRandomColor()
                            }].concat(links);

                            setEdges(addLink);

                            setDrawLinkStart(null);
                        }
                    }
                }}
                onMouseEnter={(e) => {
                    setOrientedShape({
                        ...orientedShape,
                        x: e.evt.x,
                        y: e.evt.y,
                    })
                }}
                onMouseMove={(event) => {
                    setOrientedShape({
                            ...orientedShape,
                            x: event.evt.x,
                            y: event.evt.y,
                            color: Konva.Util.getRandomColor(),
                        }
                    )

                    if (drawLinkStart) {
                        const {currentTarget: target} = event;

                        const position = StageUtil.getAbsolutePosition(target);

                        if (position) {
                            setDrawLinkMove(position)
                        }
                    }
                }}
                scaleX={1}
                scaleY={1}
            >
                <Layer>
                    {
                        (drawLinkStart && drawLinkMove) &&
                        <DrawArrow
                            start={drawLinkStart}
                            end={drawLinkMove}
                        />
                    }
                    <Group>
                        {circles.map((circle: any, i: number) => {
                            return (
                                <CircleComponent
                                    updateLinks={updateLinks}
                                    shapeProps={circle}
                                    isSelected={circle.id === selectedId}
                                    onSelect={() => {
                                        selectShape(circle.id);
                                        setVisiblePoints('')
                                    }}
                                    onChange={(newAttrs: any) => {
                                        const circs = circles.slice();
                                        circs[i] = newAttrs;
                                        setCircles(circs);

                                        // const edgs = edges.slice();
                                        //
                                        // if (edgs[i].source.id === newAttrs.id) {
                                        //     edgs[i].source.x = newAttrs.x;
                                        //     edgs[i].source.y = newAttrs.y;
                                        // } else if (edgs[i].target.id === newAttrs.id) {
                                        //     edgs[i].target.x = newAttrs.x;
                                        //     edgs[i].target.y = newAttrs.y;
                                        // }
                                        //
                                        // setEdges(edgs);
                                    }}
                                    visiblePoints={visiblePoints}
                                    setVisiblePoints={setVisiblePoints}
                                    drawLinkStart={drawLinkStart}
                                    setDrawLinkStart={setDrawLinkStart}
                                    setDrawLinkEnd={setDrawLinkEnd}
                                />
                            );
                        })}
                    </Group>
                    {edges.map((l: any) => {

                        const {x, y, x1, y1} = getPosition(l);

                        return <Arrow
                            key={l.id}
                            points={[x, y, x1, y1]}
                            stroke={l.color}
                            strokeWidth={4}
                        />
                    })}

                    {orientedShape.start && <Circle
                        key={`orientedShape${orientedShape.id}`}
                        x={orientedShape.x + 10}
                        y={orientedShape.y + 40}
                        stroke={orientedShape.color}
                        radius={50}
                        opacity={0.8}
                        numPoints={5}
                        innerRadius={20}
                        outerRadius={40}
                        shadowColor="black"
                        shadowBlur={5}
                        shadowOpacity={0.4}
                        rotation={orientedShape.rotation}
                    />}
                    <Html>
                        <Group>
                            <Xwrapper>
                                {boxes.map((box, i) => (
                                    <DraggableBox box={box} key={i}/>
                                ))}
                                {lines.map((line, i) => (
                                    <Xarrow
                                        key={i}
                                        {...line} />
                                ))}
                            </Xwrapper>
                        </Group>
                    </Html>
                </Layer>
            </Stage>

        </div>
    )
}

export default Schema
