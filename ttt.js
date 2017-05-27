const humanReadableCoordinates = [
    '(1,1)', '(2,1)', '(3,1)',
    '(1,2)', '(2,2)', '(3,2)',
    '(1,3)', '(2,3)', '(3,3)',
];

function Square(props) {
  const className = "square" + (props.inWinningLine ? " winner" : "");
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    let inWinningLine = this.props.winningLine.reduce(
      (accumulator, value) => (accumulator + (value === i ? 1 : 0)),
      0
    );
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        inWinningLine={inWinningLine > 0}
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
  constructor() {
    super();
    this.state = {
      sortAscending: true
    };
  }

  renderHistoryItems(history) {
    let currentHistory = history.slice();
    if (!this.state.sortAscending) {
      currentHistory.reverse();
    }
    return currentHistory.map((historyState, arrayIndex) => {
      let stepNumber = (this.state.sortAscending
          ? arrayIndex : currentHistory.length - 1 - arrayIndex);
      return <HistoryItem
        key={stepNumber}
        onClick={this.props.onClick}
        move={stepNumber}
        description={historyState.description}
        isSelected={this.props.selectedStep === stepNumber}
      />
    });
  }

  sortHistory() {
    this.setState({
      sortAscending: !this.state.sortAscending
    })
  }

  render() {
    let order = (this.state.sortAscending
        ? "Sort in descending order" : "Sort in ascending order");

    return (
      <div>
        <ul>
          {this.renderHistoryItems(this.props.history)}
        </ul>
        <a onClick={() => this.sortHistory()} href="#">{order}</a>
      </div>
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
      winningLine: [],
      xIsNext: true
    };
  }

  handleClick(i) {
    const stepNumber = this.state.stepNumber + 1;
    const history = this.state.history.slice(0, stepNumber);
    const current = history[stepNumber - 1];
    if (this.state.winner && stepNumber === this.state.history.length) {
      return;
    }
    const squares = current.squares.slice();
    if (squares[i]) {
      return;
    }
    const player = this.state.xIsNext ? "X" : "O";
    squares[i] = player;
    const winDetails = calculateWinner(squares);
    this.setState({
      history: history.concat([
        {
          squares: squares,
          description: `Move ${stepNumber}: ${player} to ${humanReadableCoordinates[i]}`
        }
      ]),
      stepNumber: stepNumber,
      winner: winDetails.winner,
      winningLine: winDetails.winningLine,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    const winDetails = calculateWinner(this.state.history[step].squares.slice());
    this.setState({
      stepNumber: step,
      winningLine: winDetails.winningLine,
      xIsNext: step % 2 ? false : true
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.state.winner;

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
            winningLine={this.state.winningLine}
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
      return {
        winner: squares[a],
        winningLine: [a, b, c]
      };
    }
  }
  return {
    winner: null,
    winningLine: []
  };
}
