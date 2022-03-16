import React, {useState} from "react";
import {NextPage} from "next";
import Draggable from 'react-draggable';
import styles from '../../../styles/Home.module.scss'
import {ReactComponent as MenuIcon} from '../../../assets/images/icons/s_menu.svg';
import {ReactComponent as AddLinkIcon} from '../../../assets/images/icons/s_add_conection.svg';
import {ReactComponent as AddNoteIcon} from '../../../assets/images/icons/s_add_note.svg';
import {ReactComponent as AddPencilIcon} from '../../../assets/images/icons/s_pencil.svg';
import {ReactComponent as AddTextIcon} from '../../../assets/images/icons/s_add_text.svg';
import {ReactComponent as FreeFormIcon} from '../../../assets/images/icons/s_free_form.svg';
import {ReactComponent as AddSvgIcon} from '../../../assets/images/icons/s_add_icon.svg';
import Figures from "./figures";

const ToolBar: NextPage = ({orientedShape, setOrientedShape}) => {

    return (
        <>
            <Draggable
                handle=".handle"
                bounds='parent'>
                <div className={styles.container}>
                    <button className={`${styles.menu} handle`}>
                        <MenuIcon/>
                    </button>

                    <Figures orientedShape={orientedShape} setOrientedShape={setOrientedShape}>
                        <button className={styles.addLink} onClick={() => {
                        }}>
                            <AddLinkIcon/>
                        </button>

                        <button className="" onClick={() => {
                        }}>
                            <AddNoteIcon/>
                        </button>

                        <button className="" onClick={() => {
                        }}>
                            <AddPencilIcon/>
                        </button>

                        <button className="" onClick={() => {
                        }}>
                            <AddTextIcon/>
                        </button>

                        <button className="" onClick={() => {
                        }}>
                            <FreeFormIcon/>
                        </button>

                        <button className="" onClick={() => {
                        }}>
                            <AddSvgIcon/>
                        </button>
                    </Figures>
                </div>
            </Draggable>
        </>
    );
}

export default ToolBar;
