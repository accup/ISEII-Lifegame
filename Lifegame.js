class Lifegame {
	constructor (screen) {
		this.screen = screen;
		this.ctx = this.screen.getContext('2d');
		this._rows = 0;
		this._columns = 0;
		this._field = [];
		this._workDRow = 0;
		this._workDColumn = 0;
		this._workRows = 0;
		this._workColumns = 0;
		this._workField = [];
		this._generation = 1;
		this._population = 0;
		
		// 描画スタイルの設定
		this._style = new Proxy({
			_lifegame: this,
			borderColor: "#6080FF",
			borderWidth: 1,
			neighbourFontScale: 0.7,
			neighbourFontFamily: "'Courier New'",
			neighbourColor: "none",
			squareColor: "#C0F0FF",
			squareSize: 8
		}, {
			set (target, prop, value) {
				if (prop in target) {
					target[prop] = value;

					switch (prop) {
					case "squareSize":
						target._lifegame._remakeCanvas();	
						break;
					}
				
					target._lifegame.draw();
				}
			}
		});

		this._resized = false;
		this._suppressDraw = false;
	}

	_remakeCanvas () {
		this.screen.width = this.style.squareSize * this.columns - 1;
		this.screen.height = this.style.squareSize * this.rows - 1;
	}

	_remakeWorkField () {
		this._workDRow = 0;
		this._workDColumn = 0;
		this._workRows = this.rows;
		this._workColumns = this.columns;

		this._workField = new Array(this._workRows + 1);
		for (let i=-1; i<=this._workRows; ++i) {
			let workRow = new Array(this._workColumns + 1);
			for (let j=-1; j<=this._workColumns; ++j) {
				workRow[j] = 0;
			}
			this._workField[i] = workRow;
		}
	}

	_reset (rows, columns) {
		this._rows = rows;
		this._columns = columns;
		this._generation = 1;
		this._population = 0;
		this._field = new Array(this.rows + 1);
		for (let i=-1; i<=this.rows; ++i) {
			let row = new Array(this.columns + 1);
			for (let j=-1; j<=this.columns; ++j) {
				row[j] = 0;
			}
			this._field[i] = row;
		}

		this._resized = false;

		this._remakeCanvas();
		this.draw();
	}

	reset (rows, columns) {
		this._reset(rows, columns);
		this._remakeWorkField();
	}

	resize (rows, columns, dRow, dColumn) {
		dRow = void 0 == dRow ? 0 : dRow;
		dColumn = void 0 == dColumn ? 0 : dColumn;

		if (!this._resized) {
			this._workField = this._field;
		}

		this._reset(rows, columns);

		this._workDRow += dRow;
		this._workDColumn += dColumn;

		this._population = 0;

		let copy_sr = Math.max(0, -this._workDRow);
		let copy_sc = Math.max(0, -this._workDColumn);
		let copy_er = Math.min(this.rows - this._workDRow, this._workRows);
		let copy_ec = Math.min(this.columns - this._workDColumn, this._workColumns);
		for (let i=copy_sr; i<copy_er; ++i) {
			for (let j=copy_sc; j<copy_ec; ++j) {
				let fi = i + this._workDRow;
				let fj = j + this._workDColumn;
				this._field[fi][fj] = this._workField[i][j];
				if (1 === this._field[fi][fj]) {
					++this._population;
				}
			}
		}
		this.draw();

		this._resized = true;
	}

	draw () {
		if (this._suppressDraw) return;

		let sw = this.screen.width, sh = this.screen.height;
		let sq = this.style.squareSize;
		this.ctx.clearRect(0, 0, sw, sh);
		
		this.ctx.fillStyle = this.style.squareColor;
		for (let i=0; i<this.rows; ++i) {
			for (let j=0; j<this.columns; ++j) {
				if (0 != this._field[i][j]) {
					this.ctx.fillRect(sq * j, sq * i, sq, sq);
				}
			}
		}
		
		if ('none' !== this.style.neighbourColor) {
			this.ctx.font = `${this.style.neighbourFontScale * sq}px ${this.style.neighbourFontFamily}`;
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.fillStyle = this.style.neighbourColor;

			for (let i=0; i<this.rows; ++i) {
				for (let j=0; j<this.columns; ++j) {
					let neighbour = this._field[i-1][j-1] + this._field[i-1][j] + this._field[i-1][j+1]
									+ this._field[i][j-1] + this._field[i][j+1]
									+ this._field[i+1][j-1] + this._field[i+1][j] + this._field[i+1][j+1];
					this.ctx.fillText(neighbour, sq*(j + 0.5), sq*(i + 0.56));
				}
			}
		}
			
		if ('none' !== this.style.borderColor) {
			this.ctx.strokeStyle = this.style.borderColor;
			this.ctx.lineWidth = this.style.borderWidth;
			this.ctx.beginPath();
			for (let i=1; i<this.rows; ++i) {
				this.ctx.moveTo(0, sq * i + 0.5);
				this.ctx.lineTo(sw, sq * i + 0.5);
			}
			for (let j=1; j<this.columns; ++j) {
				this.ctx.moveTo(sq * j + 0.5, 0);
				this.ctx.lineTo(sq * j + 0.5, sh);
			}
			this.ctx.stroke();
		}
	}

	next () {
		if (this._resized) {
			this._remakeWorkField();
			this._resized = false;
		}

		for (let i=0; i<this.rows; ++i) {
			for (let j=0; j<this.columns; ++j) {
				this._workField[i][j] = this._field[i][j];
			}
		}

		this._population = 0;
		for (let i=0; i<this.rows; ++i) {
			for (let j=0; j<this.columns; ++j) {
				let neighbour = this._workField[i-1][j-1] + this._workField[i-1][j] + this._workField[i-1][j+1]
								+ this._workField[i][j-1] + this._workField[i][j+1]
								+ this._workField[i+1][j-1] + this._workField[i+1][j] + this._workField[i+1][j+1];
				
				if (0 == this._field[i][j]) {
					// 死のセル
					if (3 == neighbour) {
						// 誕生
						this._field[i][j] = 1;
					}
				} else {
					// 生のセル
					if (neighbour <= 1) {
						// 過疎
						this._field[i][j] = 0;
					} else if (4 <= neighbour) {
						// 過密
						this._field[i][j] = 0;
					}
				}
			
				this._population += this._field[i][j];
			}
		}
		++this._generation;
		this.draw();
	}

	load (rows, columns, data) {
		this._suppressDraw = true;

		this.reset(rows, columns);

		let n = data.length;
		for (let i=0; i<this.rows; ++i) {
			let row = i * this.columns;
			for (let j=0; j<this.columns; ++j) {
				this._field[i][j] = row + j < n && '1' === data[row + j] ? 1 : 0;
				this._population += this._field[i][j];
			}
		}

		this._suppressDraw = false;
		this.draw();
	}

	read () {
		let obj = {
			rows: this.rows,
			columns: this.columns,
			data: ""
		};
		for (let i=0; i<this.rows; ++i) {
			for (let j=0; j<this.columns; ++j) {
				obj.data += this._field[i][j];
			}
		}

		return obj;
	}

	toggleAt (i, j) {
		if (this._resized) {
			this._remakeWorkField();
			this._resized = false;
		}
		
		if (i < 0 || this.rows <= i || j < 0 || this.columns <= j) return;

		if (0 == this._field[i][j]) {
			this._field[i][j] = 1;
			++this._population;
		} else {
			this._field[i][j] = 0;
			--this._population;
		}
		this.draw();
	}

	get style () { return this._style; }

	get rows () { return this._rows; }
	get columns () { return this._columns; }

	get generation () { return this._generation; }
	get population () { return this._population; }
}

