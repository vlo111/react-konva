import type {NextPage} from 'next'
import {Layer, Stage} from "react-konva";

const KonvaStage: NextPage<any> = ({children, ...props}: any) => {

    return (
            <Stage
                width={1200}
                height={800}
                {...props}
            >
                <Layer>
                    {children}
                </Layer>
            </Stage>
    )
}

export default KonvaStage
