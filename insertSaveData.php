<?php
	require_once('../.config/config.php');

	// 接続
	try {
		$dbh = new PDO('mysql:host='.$dbhost.'; port='.$dbport.'; dbname='.$dbname, $dbuser, $dbalkane);
	} catch (PDOException $e) {
		header('Content-Type: text/plain; charset=UTF-8', true, 500);
		exit($e->getMessage());
	}

	$inserted = array();
	if (isset($_POST['data']) && isset($_POST['rows']) && isset($_POST['columns'])) {
		// データのバリデーション
		$rows = (int)$_POST['rows'];
		$columns = (int)$_POST['columns'];

		if ($rows <= 0 || $columns <= 0) {
			header('Content-Type: text/plain; charset=UTF-8', true, 400);
			exit;
		}

		// データを一つ追加
		$stmt = $dbh->prepare("insert into lifegame (name, data, rows, columns, created) value (:name, :data, :rows, :columns, now())");

		$result = $stmt->execute(array(
			':name'		=> isset($_POST['name']) ? htmlspecialchars($_POST['name']) : null,
			':data'		=> $_POST['data'],
			':rows'		=> $rows,
			':columns'	=> $columns,
		));

		if ($result) {
			$stmt = $dbh->prepare("select * from lifegame where id = last_insert_id()");
			$stmt->execute();
			$datum = $stmt->fetch(PDO::FETCH_ASSOC);

			$inserted[] = array(
				'id'		=> (int)$datum['id'],
				'name'		=> $datum['name'],
				'data'		=> $datum['data'],
				'rows' 		=> (int)$datum['rows'],
				'columns'	=> (int)$datum['columns'],
				'created'	=> $datum['created'],
			);
		} else {
			header('Content-Type: text/plain; charset=UTF-8', true, 400);
			exit;
		}
	} else {
		header('Content-Type: text/plain; charset=UTF-8', true, 400);
		exit;
	}

	// JSON形式で送信
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($inserted);
?>
