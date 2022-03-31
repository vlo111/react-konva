import type {NextPage} from 'next'
import {Group, Circle, Layer, TextPath} from "react-konva";
import {useState} from "react";
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
        const nodes: any = [].concat(circles);
        const target: any = [].concat(node)[0]

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
            if(same.some((s: any) => s.id === f.id )) {
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
                if ( a.source.id === source.id && a.target.id === orientedArrow.target.id ||
                    a.source.id === orientedArrow.target.id && a.target.id === source.id)
                {
                    return a;
                }
                return null;
            });

            if (sameClone.length < 1) {
                const cloneArrows = _.cloneDeep(arrows).map((f: any) => {
                    if(sameClone.some((s: any) => s.id === f.id )) {
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

        if (
            orientedArrow.status === STATUS.start ||
            orientedArrow.status === STATUS.move
        ) {
            const position = StageUtil.getAbsolutePosition(event.currentTarget);

            if (position) {

                const source = circles.find((c: any) => c.id === orientedArrow.source.id);

                const target = circles.find((c: any) => c.id === orientedArrow.target.id);

                const update = updatePoints({
                    source: {
                        x: source.x,
                        y: source.y
                    },
                    target: {
                        x: target ? target.x : position.x,
                        y: target ? target.y : position.y
                    },
                }, [OFFSET.default, orientedArrow.target.id ? OFFSET.default : OFFSET.initial]);

                const newOrientedArrow = {
                    ...orientedArrow,
                    source: {
                        ...update.source,
                        id: orientedArrow.source.id,
                    },
                    target: {
                        ...update.target,
                        id: orientedArrow.target.id,
                    },
                    status: STATUS.move,
                }

                if (target) {
                    overShapeStyle(target);

                    setOrientedArrow(newOrientedArrow)
                } else {
                    setOrientedArrow({...newOrientedArrow, same: null})
                }

            }
        }
    }

    const clickStage = (e: Konva.KonvaEventObject<MouseEvent>) => {
        // create node
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
        }

        // create link
        if (e.target.name() !== 'circle') {
            if (orientedArrow.status !== STATUS.inactive)
                setOrientedArrow({...orientedArrow, status: STATUS.inactive})
        } else {
            const {target} = e;

            const {status} = orientedArrow;

            if (status === STATUS.active) {

                const position = target.getAbsolutePosition()

                setOrientedArrow({
                    id: uuidv4(),
                    source: {
                        ...position,
                        id: target.id()
                    },
                    target: position,
                    status: STATUS.start,
                    stroke: Konva.Util.getRandomColor()
                })

            } else if (status === STATUS.move) {

                const nodeSource = circles.find((c: any) => c.id === orientedArrow.source.id);

                const nodeTarget = circles.find((c: any) => c.id === target.id());

                const update = updatePoints({
                    source: {
                        x: nodeSource.x,
                        y: nodeSource.y
                    },
                    target: {
                        x: nodeTarget.x,
                        y: nodeTarget.y
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
                        id: target.id(),
                        x: update.target.x,
                        y: update.target.y,
                    },
                    stroke: orientedArrow.stroke,
                    same: orientedArrow.same
                }].concat(arrows);

                setArrows(addLink);

                setOrientedArrow({...orientedArrow, status: STATUS.inactive})

                leaveShapeStyle();

            }
        }

        document.body.style.cursor = 'auto';
    }

    //#endregion STAGE

    //#region SHAPE

    const overCircle = (e: any) => {
        if (
            (orientedArrow.status === STATUS.move) &&
            !orientedArrow.target.id &&
            orientedArrow.source.id !== e.target.id()
        ) {
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

            const source = circles.find((c: any) => c.id === l.source.id);

            const target = circles.find((c: any) => c.id === l.target.id);

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

                        {orientedArrow.status === STATUS.start
                            || orientedArrow.status === STATUS.move &&
                            <Arrow key="orientedArrow" arrow={orientedArrow} dash={[4, 4]}/>
                        }
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
