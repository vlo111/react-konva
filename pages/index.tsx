import type {NextPage} from 'next'
import dynamic from "next/dynamic";
import { v4 as uuidv4 } from 'uuid';

const NoSSRComponent = dynamic(() => import("../components/schema"), {
    ssr: false,
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const initNodes = () => {
    const items = [];
    for (let i = 4; i < 8; i++) {
        items.push({
            id: uuidv4(),
            x: i * 100,
            y: i * 50,
            width: 100,
            height: 100,
            rotation: Math.random() * 180,
            isDragging: false,
            stroke: getRandomColor(),
            strokeWidth: 2,
            name: 'Lorem Ipsum is simply dummy text of the printing. ' + i,
        });
    }
    return items;
}

const initLinks = () => {
    const items = [];

    const source = initNodes()[0];
    const target = initNodes()[1];

    items.push(
        {
            id: uuidv4(),
            source: {
                id: source.id,
                x: source.x,
                y: source.y,
            },
            target: {
                id: target.id,
                x: target.x - 40,
                y: target.y - 40,
            },
            color: getRandomColor(),
        }
    );
    return items;
}

const Home: NextPage = () => {
    const nodes = initNodes();
    const links = initLinks();
    return (
        <div>
            <NoSSRComponent nodes={nodes} links={[]}/>
        </div>
    )
}

export default Home
