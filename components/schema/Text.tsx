import React, {useEffect, useRef, useState} from "react";
import { Text } from "react-konva";
import { Html } from "react-konva-utils";
import { IEditable, IPosition, ICustomText } from "../../types/schema";
import { NextPage } from "next";

type Editable = IEditable & IPosition & ICustomText;

const CustomText: NextPage<Editable> = ({ name, x, y, width, height, editableText, setEditable, lineHeight }) => {

    const [value, setValue] = useState(name);

    const textAreaRef = useRef<HTMLElement>(null);

    const textFocus = () => {

        const { current: textArea } = textAreaRef;
        if (textArea) {
            textArea.focus();

            const { textContent } = textArea;

            if (textContent && textContent.length) {

                const range = document.createRange();

                range.setStart(textArea.childNodes[0], textContent.length);
                range.setEnd(textArea.childNodes[0], textContent.length);

                const sel = window.getSelection()!;

                sel.removeAllRanges();
                sel.addRange(range);

                textArea.scrollTo(0, textArea.scrollHeight)
            }
        }
    }

    textFocus()

    return (editableText === name ?
            <Html
                groupProps={{x: x - 5, y: y}}
            >
                <div style={{
                    height: height,
                    width: width}} className="editableContainer">
                    <div
                        style={{
                            maxHeight: height,
                            width: width}}
                        ref={textAreaRef as React.RefObject<HTMLDivElement>}
                        id={name}
                        className="editableNode"
                        // onChange={(e) => {
                        //     const {value} = e.currentTarget;
                        //     debugger
                        //     if (value <= 50)
                        //         setValue(value);
                        // }}
                        // onKeyDown={onKeyDown}
                        // style={style}
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onInput={(ev) => {
                            // setValue(ev.currentTarget.textContent)
                            // textFocus(ev.currentTarget);
                        }}
                        data-placeholder="Add Text"
                    >
                        {value}
                    </div>
                </div>
            </Html> :
            <Text
                key={'t' + name}
                x={x + 5}
                y={y}
                // align="center"
                verticalAlign="middle"
                text={value.length > 22 ? `${value.slice(0, 22)}...` : value}
                fill="black"
                fontSize={18}
                lineHeight={lineHeight}
                perfectDrawEnabled={false}
                onDblClick={() => {
                    setEditable(name);
                    // const elem = document.getElementById(name)

                    textFocus();
                }}
                width={width}
                height={height}
            />
    );
}

export default CustomText;
