import type {NextPage} from 'next'
import {Group, Circle, Layer, TextPath} from "react-konva";
import React, {useState} from "react";
import Shape from "./Shape";
import styles from '../../styles/Home.module.scss'
import Arrow from "./Arrow";
import ToolBar from "../tool-bar";
import Konva from "konva";
import StageUtil from "../../services/Stage";
import KonvaStage from "./Stage";
import _ from "lodash";
import {v4 as uuidv4} from 'uuid';

const STATUS = Object.freeze({
    "start": 1,
    "move": 2,
    "end": 3,
    "active": 4,
    "inactive": 5
})

const OFFSET = Object.freeze({
    "initial": 10,
    "default": 55,
})

const InitOrientedShape = {
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

    const [orientedShape, setOrientedShape] = useState<any>(InitOrientedShape);

    const [orientedArrow, setOrientedArrow] = useState<any>(InitOrientedArrow);

    const [editableText, setEditableText] = useState<number>(0);

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

        target.shadowBlur = 4;
        target.shadowOpacity = 0.4;

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
            }
        })

        setCircles(circs)
    }

    const sameArrows = (sourceId: any, targetId: any) => _.cloneDeep(arrows).filter((p: any) => (
            p.source.id === sourceId && p.target.id === targetId ||
            p.target.id === sourceId && p.source.id === targetId
        )
    );

    const calcSameLinks = (same: any) => {
        _.forEach(same, (link: any) => {
            _.forEach(same, (l: any, i: number) => {
                const reverse = l.source.id === link.target.id || l.target.id === link.source.id;
                const totalHalf = same.length / 2;
                const index = i + 1;
                const even = same.length % 2 === 0;
                const half = Math.floor(same.length / 2);
                const middleLink = !even && Math.ceil(totalHalf) === index;
                const indexCorrected = index <= totalHalf ? index : index - Math.ceil(totalHalf);

                let arcDirection = index <= totalHalf ? 0 : 1;
                if (reverse) {
                    arcDirection = arcDirection === 1 ? 0 : 1;
                }

                let arc = half / (indexCorrected - (even ? 0.5 : 0));

                if (middleLink) {
                    arc = 0;
                }

                l.same = arc ? {
                    arcDirection,
                    arc,
                } : null;
            });
        });

        const cloneArrows = _.cloneDeep(arrows).map((f: any) => {
            if (same.some((s: any) => s.id === f.id)) {
                f = same.filter((s: any) => s.id === f.id)[0]
            }
            return f;
        })

        setArrows(cloneArrows);
    }

    const makeSameLinks = (source: any, target: any) => {

        const same = sameArrows(source.id, target.id);

        const cloneOrientedArrow = _.cloneDeep(orientedArrow);

        let oriented = null;

        if (same.length) {

            same.push(cloneOrientedArrow)

            calcSameLinks(same);

            oriented = same.pop(cloneOrientedArrow);

        } else {
            const ca = _.cloneDeep(arrows);

            const sameClone = ca.filter((a: any) => {
                if (a.source.id === source.id && a.target.id === orientedArrow.target.id ||
                    a.source.id === orientedArrow.target.id && a.target.id === source.id) {
                    return a;
                }
                return null;
            });

            if (sameClone.length < 1) {
                const cloneArrows = _.cloneDeep(arrows).map((f: any) => {
                    if (sameClone.some((s: any) => s.id === f.id)) {
                        f.same = null
                    }
                    return f;
                })

                setArrows(cloneArrows);
            } else {
                calcSameLinks(sameClone);
            }

        }

        setOrientedArrow({
            ...orientedArrow,
            target,
            same: oriented ? oriented.same : null,
        });
    }

    const isLinkMove = () =>
        orientedArrow.status === STATUS.start
        || orientedArrow.status === STATUS.move;

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
                    count: arrows.filter(p => p.source.id ===orientedArrow.source.id && p.itself).length
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

    //#region HANDLERS

    //#region STAGE
    const moveStage = (event: any) => {
        if (orientedShape.start) {
            setOrientedShape({
                    ...orientedShape,
                    x: event.evt.x,
                    y: event.evt.y,
                }
            )
        }

        if (isLinkMove()) {

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
            console.log(target)
                overShapeStyle(target);

                setOrientedArrow({...newOrientedArrow, itself: false})
            } else {
                setOrientedArrow({...newOrientedArrow, same: null, itself: false})
            }
        }
    }

    const clickStage = (e: Konva.KonvaEventObject<MouseEvent>) => {
        // create shape
        if (orientedShape.start) {
            setOrientedShape({
                ...InitOrientedShape,
                start: false,
            })

            addCircle({
                id: uuidv4(),
                x: orientedShape.x,
                y: orientedShape.y,
                rotation: orientedShape.rotation,
                color: orientedShape.color,
            });
            document.body.style.cursor = 'auto';

            // add editable text item in shape
            setEditableText("");
        }

        // create connection
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

        // disable editable text active in shape
        if (e.target.nodeType === 'Stage') {
            setEditableText(0);
        }
    }

    //#endregion STAGE

    //#region SHAPE

    const overCircle = (e: any) => {
        if ((orientedArrow.status === STATUS.move) &&
            !orientedArrow.target.id &&
            orientedArrow.source.id !== e.target.id()) {
            const source = circles.find((c: any) => c.id === orientedArrow.source.id);

            const target = circles.find((c: any) => c.id === e.target.id());

            makeSameLinks(source, {...orientedArrow.target, id: target.id});
        }
    }

    const leaveCircle = () => {
        if (orientedArrow.status === STATUS.move && orientedArrow.target.id) {

            const source = circles.find((c: any) => c.id === orientedArrow.source.id);

            makeSameLinks(source, {...orientedArrow.target, id: null});
        }

        leaveShapeStyle();
    }

    const dragMoveCircle = (id: any, pos: any) => {
        const lnks = arrows.slice();

        arrows.forEach((l: any) => {

            const source = findCircle(l.source.id);

            const target = findCircle(l.target.id);

            const update = updatePoints({
                source: {
                    x: source.id === id ? pos.x : source.x,
                    y: source.id === id ? pos.y : source.y
                },
                target: {
                    x: target.id === id ? pos.x : target.x,
                    y: target.id === id ? pos.y : target.y
                },
            }, [OFFSET.default, OFFSET.default])

            if (update) {
                l.source = {
                    ...l.source,
                    ...update.source
                }
                l.target = {
                    ...l.target,
                    ...update.target
                }
            }

            if (l.itself) {
                l.itself = {
                    ...l.itself,
                    startX: update.source.x + 5,
                    startY: update.source.y,
                    endX:   update.source.x + 105,
                }
            }
        })

        setPosition(pos)

        setArrows(lnks);
    }

    const dragendCircle = (newAttrs: any, index: number) => {
        const circs = circles.slice();

        circs[index] = newAttrs;

        setCircles(circs);
    }

    //#endregion SHAPE

    //#endregion handler

    return (
        <div id="container-wrapper" className={styles.scheme}>
            <ToolBar
                setOrientedShape={setOrientedShape}
                orientedShape={orientedShape}
                setOrientedArrow={() => {
                    document.body.style.cursor = 'crosshair';

                    setOrientedArrow({
                        ...orientedArrow,
                        status: STATUS.active
                    })
                }}
            />
            <KonvaStage
                onMouseMove={moveStage}
                onClick={clickStage}
            >
                <Layer>
                    <Group>
                        {arrows.map((link: any, i: number) => {
                            return (
                                <Arrow key={'arrows-' + link.id + i} arrow={link}/>
                            )
                        })}

                        {circles.map((circle: any, i: number) => {
                            return (
                                <Shape
                                    key={i}
                                    shapeProps={circle}
                                    editableText={editableText}
                                    setEditable={(value: number) => {
                                        setEditableText(value);
                                    }}
                                    onDragEnd={(newCircle: any) => dragendCircle(newCircle, i)}
                                    onDragMove={dragMoveCircle}
                                    onMouseEnter={overCircle}
                                    onMouseLeave={leaveCircle}
                                    draggable
                                />
                            );
                        })}

                        {orientedShape.start && <Circle
                            key={`orientedShape${orientedShape.id}`}
                            x={orientedShape.x}
                            y={orientedShape.y}
                            stroke={orientedShape.color}
                            strokeWidth={2}
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

                        { isLinkMove() && <Arrow key="orientedArrow" arrow={orientedArrow} dash={[4, 4]}/> }
                    </Group>
                </Layer>
            </KonvaStage>
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
