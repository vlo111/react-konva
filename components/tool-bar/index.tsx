import React from "react";
import {NextPage} from "next";
import Draggable from 'react-draggable';
import styles from '../../styles/Home.module.scss'
import {ReactComponent as MenuIcon} from '../../assets/images/icons/s_menu.svg';
import {ReactComponent as AddLinkIcon} from '../../assets/images/icons/s_add_conection.svg';
import {ReactComponent as AddNodeIcon} from "../../assets/images/icons/s_add_node.svg";
import Konva from "konva";

const ToolBar: NextPage<any> = (
    {
        orientedShape, setOrientedShape,
        setOrientedArrow,
    }: any) => {

    return (
        <>
            <Draggable
                handle=".handle"
                bounds='parent'>
                <div className={styles.container}>
                    <button className={`${styles.menu} handle`}>
                        <MenuIcon/>
                    </button>

                    <button
                        className="" onClick={() => {

                        document.body.style.cursor = 'crosshair';

                        setOrientedShape({
                            ...orientedShape,
                            color: Konva.Util.getRandomColor(),
                            start: true,
                        })
                    }}>
                        <AddNodeIcon/>
                    </button>

                    <button className={styles.addLink} onClick={setOrientedArrow}>
                        <AddLinkIcon/>
                    </button>
                </div>
            </Draggable>

        </>
    );
}

export default ToolBar;
