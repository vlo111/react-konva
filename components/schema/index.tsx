import type {NextPage} from 'next'
import React, {useState} from "react";
import styles from '../../styles/Home.module.scss'
import ToolBar from "../tool-bar";
import Konva from "konva";
import StageUtil from "../../services/Stage";
import Stage from "./Stage";
import _ from "lodash";
import {v4 as uuidv4} from 'uuid';
import {OFFSET, STATUS} from "../../services/data/Drow";
import Group from "./Group";

const InitDrawShape = {
    id: 'control_node',
    x: 0,
    y: 0,
    rotation: 50,
    start: false,
    stroke: Konva.Util.getRandomColor(),
    strokeWidth: 2
}

const InitOrientedArrow = {
    id: uuidv4(),
    source: {
        x: 0,
        y: 0
    },
    target: {
        x: 0,
        y: 0
    },
    status: STATUS.inactive,
    color: Konva.Util.getRandomColor()
}

const Schema: NextPage = ({nodes, links}: any) => {

    //# region STATES
    const [position, setPosition] = useState({x: 0, y: 0});

    const [circles, setCircles] = useState(nodes);

    const [arrows, setArrows] = useState(links);

    const [drawShape, setDrawShape] = useState<any>(InitDrawShape);

    const [orientedArrow, setOrientedArrow] = useState<any>(InitOrientedArrow);
    //# endregion

    //#region HELPERS

    const updatePoints = (points: any, offsets: any) => getPoints(points.source, points.target, offsets)

    const getPoints = (p1: any, p2: any, offsets: any) => {

        const deltaX = p1.x - p2.x;
        const deltaY = p1.y - p2.y;

        const rad = Math.atan2(deltaY, deltaX);

        return {
            source:
                {
                    x: p1.x + offsets[0] * Math.cos(rad + Math.PI),
                    y: p1.y + offsets[0] * Math.sin(rad + Math.PI),
                },
            target:
                {
                    x: p2.x + offsets[1] * Math.cos(rad),
                    y: p2.y + offsets[1] * Math.sin(rad),
                }
        }
    }

    const addCircle = (circle: any) => {
        const circ = {
            x: circle.x,
            y: circle.y,
            name: '',
            width: 100,
            height: 100,
            stroke: circle.color,
            strokeWidth: 2,
            id: uuidv4(),
        };
        const circs = circles.concat([circ]);
        setCircles(circs);
    };

    const overShapeStyle = (node: any) => {

        const nodes: any = _.cloneDeep(circles);
        const target: any = _.cloneDeep(node)

        target.strokeOver = '#498bfd'
        target.strokeWidth = 3

        target.shadowBlur = 20;
        target.shadowOffsetX = 0;
        target.shadowOffsetY = 14;

        target.shadowOpacity = 0.1;

        nodes[nodes.findIndex((el: any) => el.id === node.id)] = target;

        setCircles(nodes)
    }

    const leaveShapeStyle = () => {
        const circs: any = [].concat(circles);

        circs.forEach((c: any) => {
            if (c.strokeOver) {
                c.strokeOver = null
                c.fillOver = null
                c.strokeWidth = 2
                c.shadowBlur = 0;
                c.shadowOpacity = 1;
                c.shadowOffsetY = 0;
            }
        })

        setCircles(circs)
    }

    const isSelfLoop = (source: any, position: any) => {
        const startX = source.x - 60;
        const startY = source.y - 60;

        const endX = source.x + 60;
        const endY = source.y + 60;

        // itself loop
        if (position.x > startX && position.x < endX &&
            position.y > startY && position.y < endY
        ) {
            setOrientedArrow({
                ...orientedArrow, itself: {
                    startX: source.x - 50,
                    startY: source.y,
                    endX: source.x + 50,
                    count: arrows.filter((p: any) => p.source.id ===orientedArrow.source.id && p.itself).length
                }
            })

            overShapeStyle(source);

            return true;
        }
        leaveShapeStyle();

        return false;
    }

    const findCircle = (id: any) => circles.find((c: any) => c.id === id);

    //#endregion HELPERS

    // HANDLERS

    const moveStage = (event: any) => {
        if (drawShape.start) {
            setDrawShape({
                    ...drawShape,
                    x: event.evt.x,
                    y: event.evt.y,
                }
            )
        }

        if (orientedArrow.status === STATUS.start || orientedArrow.status === STATUS.move) {

            const position = StageUtil.getAbsolutePosition(event.currentTarget);

            if (!position) return;

            const source = findCircle(orientedArrow.source.id);

            const target = findCircle(orientedArrow.target.id);

            const outside = updatePoints({
                source: {
                    x: source.x,
                    y: source.y
                },
                target: {
                    x: target ? target.x : position.x,
                    y: target ? target.y : position.y
                },
            }, [OFFSET.default, orientedArrow.target.id ? OFFSET.default : OFFSET.initial]);

            if (isSelfLoop(source, position)) return;

            const newOrientedArrow = {
                ...orientedArrow,
                source: {
                    ...outside.source,
                    id: orientedArrow.source.id,
                },
                target: {
                    ...outside.target,
                    id: orientedArrow.target.id,
                },
                status: STATUS.move,
            }

            if (target) {
                overShapeStyle(target);

                setOrientedArrow({...newOrientedArrow, itself: false})
            } else {
                setOrientedArrow({...newOrientedArrow, same: null, itself: false})
            }
        }
    }

    const clickStage = (e: Konva.KonvaEventObject<MouseEvent>) => {
        // create node
        if (drawShape.start) {
            setDrawShape({
                ...InitDrawShape,
                start: false,
            })

            addCircle({
                id: uuidv4(),
                x: drawShape.x,
                y: drawShape.y,
                rotation: drawShape.rotation,
                color: drawShape.color,
            });
            document.body.style.cursor = 'auto';
        }

        // create link
        if (e.target.name() !== 'circle') {
            if (orientedArrow.status !== STATUS.inactive)
                setOrientedArrow({...orientedArrow, status: STATUS.inactive})
        } else {
            const {target: evtTarget} = e;

            const {status} = orientedArrow;

            if (status === STATUS.active) {

                const position = evtTarget.getAbsolutePosition()

                setOrientedArrow({
                    id: uuidv4(),
                    source: {
                        ...position,
                        id: evtTarget.id()
                    },
                    target: position,
                    status: STATUS.start,
                    stroke: Konva.Util.getRandomColor()
                })

            } else if (status === STATUS.move) {

                const source = circles.find((c: any) => c.id === orientedArrow.source.id);

                const target = circles.find((c: any) => c.id === evtTarget.id());

                const update = updatePoints({
                    source: {
                        x: source.x,
                        y: source.y
                    },
                    target: {
                        x: target.x,
                        y: target.y
                    },
                }, [OFFSET.default, OFFSET.default]);

                const addLink = [{
                    id: uuidv4(),
                    source: {
                        id: orientedArrow.source.id,
                        x: update.source.x,
                        y: update.source.y,
                    },
                    target: {
                        id: evtTarget.id(),
                        x: update.target.x,
                        y: update.target.y,
                    },
                    stroke: orientedArrow.stroke,
                    same: orientedArrow.same,
                    itself: orientedArrow.itself
                }].concat(arrows);

                setArrows(addLink);

                setOrientedArrow({...orientedArrow, status: STATUS.inactive})

                leaveShapeStyle();
            }
        }

        document.body.style.cursor = 'auto';
    }

    return (
        <div id="container-wrapper" className={styles.scheme}>
            <ToolBar
                setDrawShape={setDrawShape}
                drawShape={drawShape}
                setOrientedArrow={() => {
                    document.body.style.cursor = 'crosshair';

                    setOrientedArrow({
                        ...orientedArrow,
                        status: STATUS.active
                    })
                }}
            />
            <Stage
                onMouseMove={moveStage}
                onClick={clickStage}
            >
                <Group
                    arrows={arrows}
                    setArrows={setArrows}
                    circles={circles}
                    setCircles={setCircles}
                    orientedArrow={orientedArrow}
                    setOrientedArrow={setOrientedArrow}
                    drawShape={drawShape}
                    leaveShapeStyle={leaveShapeStyle}
                    setPosition={setPosition}
                    updatePoints={updatePoints}
                />
            </Stage>
            <div>
                x = {position.x}
                y = {position.y}
            </div>
            <div onClick={() => {
                setArrows([])
            }}>reset links
            </div>
        </div>
    )
}

export default Schema
