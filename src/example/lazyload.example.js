/**
 * Created by Dennis Wang
 * on 2018/4/20 0020 17:47
 */
import React from 'react';
import LazyLoad from '../Lazyload';

const uniqueId = () => (`${Math.random().toString(36)}00000000000000000`).slice(2, 10);


class Widget extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isReady: true,
      count: 1,
    };
  }

  componentWillReceiveProps(nextProps) {
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

export default class lazyloadExample extends React.PureComponent {
  constructor() {
    super();

    const id = uniqueId();
    this.state = {
      arr: Array(...Array(20)).map((a, index) => ({
        uniqueId: id,
        once: [6, 7].indexOf(index) > -1,
      })),
    };
  }

  render() {
    return (
      <div className="wrapper">
        <div className="widget-list">
          {this.state.arr.map((el, index) => (
            <LazyLoad once={el.once} key={index} height={200} offset={[-100, 0]}>
              <Widget once={el.once} id={el.uniqueId} count={index + 1} />
            </LazyLoad>
          ))}
        </div>
      </div>
    );
  }
}
