import type {NextPage} from 'next'
import { Stage } from "react-konva";

const KonvaStage: NextPage<any> = ({children, ...props}: any) => {

    return (
            <Stage
                width={1200}
                height={800}
                {...props}
            >
                {children}
            </Stage>
    )
}

export default KonvaStage
