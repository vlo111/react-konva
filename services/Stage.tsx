import Konva from "konva";

class StageUtil {
    static getAbsolutePosition = (reference: any) => {
        const stage = reference.getStage();

        if (stage) {
            const transform = stage.getAbsoluteTransform().copy();

            if (transform) {

                transform.invert();

                const pos = stage.getPointerPosition();

                if (pos) {
                    const absolutePosition = transform.point(pos);

                    return absolutePosition;
                }
            }
        }
        return null;
    }
}

export default StageUtil;
