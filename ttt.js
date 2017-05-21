const humanReadableCoordinates = [
    '(1,1)', '(2,1)', '(3,1)',
    '(1,2)', '(2,2)', '(3,2)',
    '(1,3)', '(2,3)', '(3,3)',
];

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(rowNum) {
    let row = [];
    for (let i = rowNum * 3, m = i + 3; i < m; i++) {
      row.push(this.renderSquare(i));
    }
    return (
      <div key={rowNum} className="board-row">
        {row}
      </div>
    );
  }

  render() {
    let rows = [];
    for (let i = 0; i < 3; i++) {
      rows.push(this.renderRow(i));
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

function HistoryItem(props) {
  const move = props.move;
  return (
    <li key={move}>
      <a className={props.isSelected ? "selected" : ""} href="#" onClick={() => props.onClick(move)}>
        {props.description}
      </a>
    </li>
  );
}

class History extends React.Component {
  renderHistoryItems(history) {
    return history.map((historyState, stepNumber) => {
      return <HistoryItem
        key={stepNumber}
        onClick={this.props.onClick}
        move={stepNumber}
        description={historyState.description}
        isSelected={this.props.selectedStep === stepNumber}
      />
    });
  }

  render() {
    return (
      <ol>
        {this.renderHistoryItems(this.props.history)}
      </ol>
    );
  }
}

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          description: "Game start"
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const stepNumber = history.length;
    const squares = current.squares.slice();
    const player = this.state.xIsNext ? "X" : "O";
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = player;
    this.setState({
      history: history.concat([
        {
          squares: squares,
          description: `Move ${stepNumber}: ${player} to ${humanReadableCoordinates[i]}`
        }
      ]),
      stepNumber: stepNumber,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 ? false : true
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <History
            onClick={(stepNumber) => this.jumpTo(stepNumber)}
            history={history}
            selectedStep={this.state.stepNumber}
          />
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
