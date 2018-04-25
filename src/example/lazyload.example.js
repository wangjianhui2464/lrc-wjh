/**
 * Created by Dennis Wang
 * on 2018/4/20 0020 17:47
 */
import React from 'react';
import LazyLoad, { forceCheck } from '../Lazyload/Lazyload';

import './lazyload.example.css';

const uniqueId = () => (`${Math.random().toString(36)}00000000000000000`).slice(2, 10);


const Operation = ({ onClickUpdate }) => (
  <div className="op">
    <a className="update-btn button-secondary pure-button" onClick={onClickUpdate}>Update</a>
  </div>
);


/**
 * lazyload 中显示的 组件
 */
class Widget extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isReady: true,
      count: 1,
    };
  }

  componentDidMount() {
    console.log('--加载了---', this.props);
  }

  componentWillReceiveProps(nextProps) {
    forceCheck();
    if (nextProps.id !== this.props.id && this.props.id) {
      this.setState({
        isReady: false,
      });

      setTimeout(() => {
        this.setState({
          isReady: true,
          count: this.state.count + 1,
        });
      }, 500);
    } else {
      this.setState({
        isReady: true,
      });
    }
  }

  componentWillUpdate() {
    console.log('--WillUpdate---', this.props);
  }

  render() {
    return this.state.isReady ? (
      <div className="widget">
        <span className="widget-counter">{this.props.count}</span>
        {this.props.once ? (
          <div className="widget-text once">
            <code>
              &lt;LazyLoad once&gt;<br />
              &nbsp;&nbsp;&lt;Widget /&gt;<br />
              &lt;/LazyLoad&gt;
            </code>
          </div>
        ) : (
          <div className="widget-text">
            <code>
              &lt;LazyLoad&gt;<br />
              &nbsp;&nbsp;&lt;Widget /&gt;<br />
              &lt;/LazyLoad&gt;
            </code>
          </div>
        )}
        <p>render times: {this.state.count}</p>
        <p>props from parent: {this.props.id}</p>
      </div>
    ) : (
      <div className="widget loading">
        loading...
      </div>
    );
  }
}

function PlaceholderComponent() {
  return (
    <div className="placeholder">
      <div className="spinner">
        <div className="rect1" />
        <div className="rect2" />
        <div className="rect3" />
        <div className="rect4" />
        <div className="rect5" />
      </div>
    </div>
  );
}

export default class lazyloadExample extends React.Component {
  constructor() {
    super();

    const id = uniqueId();
    this.state = {
      arr: Array(...Array(20)).map((a, index) => ({
        uniqueId: id,
        once: [6, 7].indexOf(index) > -1,
      })),
    };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const id = uniqueId();

    this.setState({
      arr: this.state.arr.map(el => ({
        ...el,
        uniqueId: id,
      })),
    });
  }

  render() {
    return (
      <div className="wrapper">
        <Operation type="overflow" onClickUpdate={this.handleClick} />
        <div className="widget-list">
          {this.state.arr.map((el, index) => (
            <LazyLoad
              style={{ position: 'absolute' }}
              once={false}
              key={index}
              height={200}
              throttle={100}
              debounce={500}
              offset={[0, 0]}

            >
              <Widget once={el.once} id={el.uniqueId} count={index + 1} />
            </LazyLoad>
          ))}
        </div>
      </div>
    );
  }
}
