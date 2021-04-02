import React, { Component } from "react";



export const ScrollBar: React.FC<{
	props: any
}> = (props): JSX.Element => {
	return (
		<p>Content</p>
	);
};

/*
export default class ScrollBar extends Component {
    constructor(props) {
        super(props);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    state = {
        cursorHeight: 10,
        cursorTop: 0,
        dragging: false,
        display: false
    };

    componentDidMount() {
        this.props.connect(() => this.calcul());
        this.calcul();
    }

    calcul() {
        const el = this.props.elementRef.current;

        const cursorHeight = (el.offsetHeight / el.scrollHeight) * el.offsetHeight;
        const cursorTop = (el.scrollTop / (el.scrollHeight - el.offsetHeight)) * (el.offsetHeight - cursorHeight);

        //On affiche la scroll bar uniquement si le curseur est plus petit ne couvre pas 100% de la scrollbar
        this.setState({
            cursorHeight,
            cursorTop,
            display: cursorHeight < this.props.elementRef.current.offsetHeight ? true : false
        });
    }

    handleMouseDown(e) {
        this.setState({ dragging: true, startY: e.clientY, startScrollTop: this.props.elementRef.current.scrollTop });
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    handleMouseMove(e) {
        if (this.state.dragging) {
            const el = this.props.elementRef.current;

            const delta = e.clientY - this.state.startY;
            let scrollTop = this.state.startScrollTop + delta;

            scrollTop =
                scrollTop < 0
                    ? 0
                    : scrollTop > el.scrollHeight - el.offsetHeight
                    ? el.scrollHeight - el.offsetHeight
                    : scrollTop;

            this.props.update(scrollTop);
        }
    }

    handleMouseUp() {
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleMouseUp);
        this.setState({ dragging: false });
    }

    render() {
        const { cursorHeight, cursorTop, display } = this.state;

        return display ? (
            <div className="ScrollBarMD">
                <div
                    style={{ height: cursorHeight + "px", top: cursorTop + "px" }}
                    onMouseDown={e => this.handleMouseDown(e)}
                ></div>
            </div>
        ) : (
            false
        );
    }
}
*/