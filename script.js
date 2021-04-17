window.addEventListener('load', e => {
	// ライフゲーム画面の処理
	let screen = document.getElementById('screen');
	let lifegame = new Lifegame(screen);
	lifegame.reset(12, 12);
	lifegame.style.squareSize = 24;


	let play_button = document.getElementById('play-button');
	let reset_button = document.getElementById('reset-button');
	
	// ライフゲームのゲームループ
	let runningTimer = 0;
	let interval = 100;
	function loop () {
		lifegame.next();
		bindings.update();
		if (0 == lifegame.population) {
			runningTimer = 0;
			play_button.classList.remove('play');
		} else {
			runningTimer = setTimeout(loop, interval);
		}
	}
	
	// 再生・停止ボタンの処理
	play_button.addEventListener('click', e => {
		if (0 == runningTimer) {
			runningTimer = setTimeout(loop, interval);
			play_button.classList.add('play');
		} else {
			clearTimeout(runningTimer);
			runningTimer = 0;
			play_button.classList.remove('play');
		}
	});

	// フィールドをシフトするボタンの処理
	let shift_left_button = document.getElementById('shift-left-button');
	let shift_right_button = document.getElementById('shift-right-button');
	let shift_up_button = document.getElementById('shift-up-button');
	let shift_down_button = document.getElementById('shift-down-button');

	shift_left_button.addEventListener('click', e => {
		lifegame.resize(lifegame.rows, lifegame.columns, 0, -1);
	});
	shift_right_button.addEventListener('click', e => {
		lifegame.resize(lifegame.rows, lifegame.columns, 0, 1);
	});
	shift_up_button.addEventListener('click', e => {
		lifegame.resize(lifegame.rows, lifegame.columns, -1, 0);
	});
	shift_down_button.addEventListener('click', e => {
		lifegame.resize(lifegame.rows, lifegame.columns, 1, 0);
	});

	// バインディングもどき
	let bindings = {
		elements: [],
		update () {
			this.elements.forEach(e => e.update());
		}
	}; 
	// 一般的な要素と変数のバインディングもどき
	function bindingElement (element, getter) {
		let binding = {
			update () {
				element.textContent = getter();
			}
		};
		bindings.elements.push(binding);
		binding.update();
		return binding;
	}
	// input[type='number'] 要素と変数のバインディングもどき
	function bindingInputNumber (element, getter, setter, min=Number.MIN_SAFE_INTEGER, max=Number.MAX_SAFE_INTEGER) {
		element.addEventListener('input', e => {
			let value = parseInt(e.target.value, 10);
			if (isNaN(value)) {
				e.target.placeholder = getter();
			} else {
				if (min <= value && value <= max) {
					setter(value);
				}
			}
		});
		element.addEventListener('blur', e => {
			let value = parseInt(e.target.value, 10);
			if (isNaN(value) || value < min || max < value) {
				e.target.value = getter();
			}
		});
		element.addEventListener('keydown', e => {
			if (e.key === 'Enter') {
				e.preventDefault();
				element.blur();
			}
		});
	
		let binding = {
			update () {
				element.value = getter();
			}
		};

		bindings.elements.push(binding);
		binding.update();
		return binding;
	}
	// input[type='radio'] 要素との変数のバインディングもどき
	function bindingInputRadio (element, getter, setter, min=Number.MIN_SAFE_INTEGER, max=Number.MAX_SAFE_INTEGER) {
		element.addEventListener('input', e => {
			let value = parseInt(e.target.value, 10);
			if (value < min) {
				value = min;
				e.target.value = value;
			} else if (max < value) {
				value = max;
				e.target.value = value;
			}
			setter(value);
		});
	
		let binding = {
			update () {
				element.value = getter();
			}
		};

		bindings.elements.push(binding);
		binding.update();
		return binding;
	}
	// input[type='checkbox'] 要素と変数のバインディングもどき
	function bindingInputCheckbox (element, getter, setter) {
		element.addEventListener('change', e => {
			setter(e.target.checked);
		});

		let binding = {
			update () {
				element.checked = getter();
			}
		};

		bindings.elements.push(binding);
		binding.update();
		return binding;
	}
	// span のバインディング
	bindingElement(
		document.getElementById('generation-span'),
		_ => lifegame.generation
	);
	bindingElement(
		document.getElementById('population-span'),
		_ => lifegame.population
	);
	// input[type='number'] のバインディング
	bindingInputNumber(
		document.getElementById('square-size-input'),
		_ => lifegame.style.squareSize,
		value => lifegame.style.squareSize = value,
		1
	);
	bindingInputNumber(
		document.getElementById('rows-input'),
		_ => lifegame.rows,
		value => lifegame.resize(value, lifegame.columns),
		1
	);
	bindingInputNumber(
		document.getElementById('columns-input'),
		_ => lifegame.columns,
		value => lifegame.resize(lifegame.rows, value),
		1
	);
	let interval_input_binding, interval_radio_binding;
	interval_input_binding = bindingInputNumber(
		document.getElementById('interval-input'),
		_ => interval,
		value => { interval = value; interval_radio_binding.update(); },
		1
	)
	// input[type='radio'] のバインディング
	interval_radio_binding = bindingInputRadio(
		document.getElementById('interval-radio'),
		_ => interval,
		value => { interval = value; interval_input_binding.update(); },
		1
	);
	// input[type='checkbox'] のバインディング
	bindingInputCheckbox(
		document.getElementById('border-visiblity'),
		_ => 'none' !== lifegame.style.borderColor,
		visiblity => lifegame.style.borderColor = visiblity ? "#6080FF" : "none"
	);
	bindingInputCheckbox(
		document.getElementById('neighbour-visiblity'),
		_ => 'none' !== lifegame.style.neighbourColor,
		visiblity => lifegame.style.neighbourColor = visiblity ? "#6080FF" : "none"
	);
	
	// リセットボタンの処理
	reset_button.addEventListener('click', e => {
		lifegame.reset(lifegame.rows, lifegame.columns);
		bindings.update();
	});
	// クリックで盤の操作
	screen.addEventListener('click', e => {
		e.preventDefault();
		e.stopPropagation();

		let bbox = screen.getBoundingClientRect();
		let j = Math.floor((e.clientX - bbox.left + 0.5) * lifegame.columns  / (bbox.width - 1));
		let i = Math.floor((e.clientY - bbox.top + 0.5) * lifegame.rows / (bbox.height - 1));
		lifegame.toggleAt(i, j);
		bindings.update();
	});
	// テキスト選択の抑制
	screen.addEventListener('mousedown', e => {
		e.preventDefault();
		e.stopPropagation();
	});


	// メニューの処理
	let menu = document.getElementById('menu');
	let menu_items = document.getElementById('menu-items');

	let save_data = {};

	// メニューアイテムクリック時の処理
	menu_items.addEventListener('click', e => {
		let target = e.target;
		while (e.currentTarget != target && null != target) {
			if ('id' in target.dataset) {
				let id = target.dataset.id;
				if (id in save_data) {
					// データの読み込みとバインディングもどきの更新
					lifegame.load(save_data[id].rows, save_data[id].columns, save_data[id].data);
					let bbox = screen.parentNode.getBoundingClientRect();
					lifegame.style.squareSize = Math.max(1, Math.min(Math.floor(bbox.height / (lifegame.rows + 1)), Math.floor(bbox.width / (lifegame.columns + 1))));
					bindings.update();
				}
				break;
			}
			target = target.parentNode;
		}
	}, false);

	// メニューに取得したセーブデータを追加
	function appendSaveDataAll (data) {
		let re = /(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/;
		let s = /^\s*$/;
		for (let i=0, n=data.length; i<n; ++i) {
			let datum = data[i];
			if (datum.rows <= 0 || datum.columns <= 0) continue;

			let item = menu_items.appendChild(document.createElement('li'));
			{
				item.dataset.id = datum.id;
				save_data[item.dataset.id] = {
					data: datum.data,
					rows: datum.rows,
					columns: datum.columns
				};

				let img = item.appendChild(document.createElement('img'));
				img.classList.add('data');
				{
					let cvs = document.createElement('canvas');
					cvs.width = datum.columns;
					cvs.height = datum.rows;
					let ctx = cvs.getContext('2d');
					let pixel = new Uint8ClampedArray(datum.rows * datum.columns * 4);
					for (let i=0; i<datum.rows; ++i) {
						let row = i * datum.columns;
						for (let j=0; j<datum.columns; ++j) {
							let pos = (row + j) * 4;
							if ('1' === datum.data[row + j]) {
								pixel[pos] = 255;
								pixel[pos + 1] = 255;
								pixel[pos + 2] = 255;
							}
							pixel[pos + 3] = 255;
						}
					}
					ctx.putImageData(new ImageData(pixel, datum.columns, datum.rows), 0, 0);
					img.src = cvs.toDataURL('image/png');
				}

				let name = item.appendChild(document.createElement('div'));
				name.classList.add('name');
				if (null == datum.name) {
					name.style.color = 'gray';
					name.textContent = "[No name]";
				} else if (s.test(datum.name)) {
					name.style.color = 'gray';
					name.textContent = `'${datum.name}'`;
				} else {
					name.textContent = datum.name;
				}

				let size = item.appendChild(document.createElement('div'));
				size.classList.add('size');
				size.textContent = `${datum.rows} × ${datum.columns}`;

				let created = item.appendChild(document.createElement('div'));
				created.classList.add('created');
				let date = datum.created.match(re);
				created.textContent = `${date[1]}/${date[2]}/${date[3]} ${date[4]}:${date[5]}:${date[6]}`;
			}
		}
	}

	// すべてのデータを取得
	fetch('getSaveData.php', { method: 'POST' })
	.then(response => {if (response.ok) return response.json();})
	.then(appendSaveDataAll)
	.catch(e => console.error(e));


	let save_button = document.getElementById('save-button');
	let save_dialog = document.getElementById('save-dialog');
	let close_save_dialog = document.getElementById('close-save-dialog');
	let insert_save_data_form = document.forms['insert-save-data'];
	save_button.addEventListener('click', e => {
		if (save_dialog.hidden) {
			save_dialog.hidden = false;

			let datum = lifegame.read();
			insert_save_data_form.elements['name'].value = '';
			insert_save_data_form.elements['rows'].value = datum.rows;
			insert_save_data_form.elements['columns'].value = datum.columns;
			insert_save_data_form.elements['data'].value = datum.data;
		}
	});
	close_save_dialog.addEventListener('click', e => {
		save_dialog.hidden = true;
	});

	insert_save_data_form.addEventListener('submit', e => {
		e.preventDefault();

		let form_data = new FormData(insert_save_data_form);

		fetch('insertSaveData.php', {
			method: 'POST',
			body: form_data
		})
		.then(response => {if (response.ok) return response.json();})
		.then(appendSaveDataAll)
		.catch(e => console.error(e));

		// 強制的にフォーカスを解除
		close_save_dialog.focus();
		close_save_dialog.blur();
		
		save_dialog.hidden = true;
	});
});



