import {Circle} from "react-konva";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;
import StageUtil from "../../services/Stage";

const getPositions = ({x, y, width, height}: any) => {

    const positions = [
        {
            x: x - (width / 2),
            y,
        },
        {
            x: x + (width / 2),
            y: y,
        },
        {
            x: x,
            y: y - (height / 2),
        },
        {
            x: x,
            y: y + (height / 2),
        }
    ];

    return {positions};
}

const GetPoints: any = ({
                            circle, visible,
                            drawLinkStart, setDrawLinkStart, setDrawLinkEnd
                        }: any) => {

    const {positions} = getPositions(circle);

    return positions.map((p: any) => (
        <Circle
            key={p.id}
            id={`control${circle.id}`}
            name="circleControl"
            x={p.x}
            y={p.y}
            fill="white"
            stroke="black"
            strokeWidth={1}
            radius={8}
            visible={visible}
            onMouseDown={(e: KonvaEventObject<MouseEvent>) => {

                const {currentTarget: target} = e;

                const position = StageUtil.getAbsolutePosition(target);

                let place;

                const valueX = target.x() - circle.x;

                const valueY = target.y() - circle.y;

                if (valueX < 0) {
                    place = 0;
                } else if (valueX > 0) {
                    place = 2;
                } else if (valueY < 0) {
                    place = 1;
                } else if (valueY > 0) {
                    place = 3
                }

                if (position) {
                    if (!drawLinkStart) {

                        setDrawLinkStart({
                            ...position,
                            place,
                            circle
                        })

                        // setDrawLink('linkMode', true)
                    } else {

                        setDrawLinkEnd({
                            ...position,
                            place,
                            circle
                        })
                    }
                }
            }}
        />
    ));
}

export default GetPoints