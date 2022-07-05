import type {NextPage} from 'next'
import { Group } from "react-konva";
import Arrow from "./Arrow";
import Shape from "./Shape";
import React from "react";
import _ from "lodash";
import {OFFSET, STATUS} from "../../services/data/Drow";
import DrawShape from "./DrawShape";

const GroupKonva: NextPage<any> = ({arrows, setArrows,
                                  circles, setCircles,
                                  orientedArrow, setOrientedArrow, drawShape,
                                  leaveShapeStyle, setPosition, updatePoints
}: any) => {

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

    const isLinkMove = () => orientedArrow.status === STATUS.start || orientedArrow.status === STATUS.move;

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

    return (
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

            {drawShape.start && <DrawShape drawShape={drawShape} />}

            { isLinkMove() && <Arrow key="orientedArrow" arrow={orientedArrow} dash={[4, 4]}/> }
        </Group>
    )
}

export default GroupKonva
