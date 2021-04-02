/*import { useCallback, useState, useEffect } from 'react';



//////////////////////////////////////////////////////////////////////////////////////////
export default function useGrab() {
    const [state, setState] = useState<null | {initialX: number, initialY: number, offsetX: number, offsetY: number}>(null);

    const startGrab = useCallback((event: React.MouseEvent) => {
        setState({x: event.clientX});
    }, [])

    const move = useCallback(() => {
        if(state) {

        }
    }, [])

    const endGrab = useCallback(() => {
        setState(null)
    }, [])

    useEffect(() => {
        document.addEventListener("mousemove", move)
    })

    return [grabstartGrab, endGrab]
}*/