<?php
	require_once('../.config/config.php');

	// 接続
	try {
		$dbh = new PDO('mysql:host='.$dbhost.'; port='.$dbport.'; dbname='.$dbname, $dbuser, $dbalkane);
	} catch (PDOException $e) {
		header('Content-Type: text/plain; charset=UTF-8', true, 500);
		exit($e->getMessage());
	}

	if (isset($_POST['id'])) {
		// 一つ取得
		$stmt = $dbh->prepare("select * from lifegame where id=:id");
		$stmt->execute(array(":id" => (int)$_POST['id']));
	} else {
		// 全取得
		$stmt = $dbh->prepare("select * from lifegame");
		$stmt->execute();
	}

	$allData = array();
	while ($datum = $stmt->fetch(PDO::FETCH_ASSOC)) {
		$allData[] = array(
			'id'		=> (int)$datum['id'],
			'name'		=> $datum['name'],
			'data'		=> $datum['data'],
			'rows' 		=> (int)$datum['rows'],
			'columns'	=> (int)$datum['columns'],
			'created'	=> $datum['created'],
		);
	}
	
	// JSON形式で送信
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($allData);
?>
