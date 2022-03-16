import React, {useState} from "react";
import {NextPage} from "next";
import styles from '../../../../styles/Home.module.scss'
import {ReactComponent as AddNodeIcon} from '../../../../assets/images/icons/s_add_node.svg';
import {ReactComponent as SquareIcon} from '../../../../assets/images/icons/f_square.svg';
import {ReactComponent as TriangleIcon} from '../../../../assets/images/icons/f_triangle.svg';
import {ReactComponent as CircleIcon} from '../../../../assets/images/icons/f_circle.svg';
import {ReactComponent as RectangleIcon} from '../../../../assets/images/icons/f_rectangle.svg';

const ToolBar: NextPage = ({ children, orientedShape, setOrientedShape }) => {

    const [figures, setFigures] = useState<boolean>(false);

    return (
        <>
            <button
                className="" onClick={() => {
                setFigures(!figures)
            }}>
                <AddNodeIcon/>
            </button>
            {children}
            {figures &&
                <div className={styles.figures}>
                    <div className={styles.f_container}>
                        <SquareIcon />
                        <TriangleIcon />
                        <CircleIcon onClick={() => {
                            document.body.style.cursor = 'crosshair';
                            setFigures(false)
                            setOrientedShape({
                                ...orientedShape,
                                start: true,
                            })
                        }} />
                        <RectangleIcon />
                    </div>
                </div>
            }
        </>
    );
}

export default ToolBar;
