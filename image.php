<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="x-ua-compatible" content="ie=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta charset="utf-8" />
		<meta name="keywords" content="MandoCreator,Beskar'gam,Armor,Mandalorian,Mando,Design,Beskar" />
		<meta name="author" content="DesignDeviant, Cin Vhetin" />
		<title>Din'kartay bralov'la</title>
		<style>
			html {
				height: 100%;
				width: 100%;
			}
			body {
				height: 100%;
				margin: 0;
				background: url(assets/foggy_small.jpg) no-repeat center;
				background-color: #222;
				background-size: cover;
			}
			.content {
				position: relative;
				top: 50%;
				color: #DDD;
				text-align: center;
				transform: translateY(-50%);
				font-size: x-large;
			}
		</style>
	</head>
	<body>
		<div class="content">
			<?php
				if (empty($_POST))
					exit;
				$name = $_POST['name'];
				$email = $_POST['email'];
				$subject = $_POST['subject'];
				$message = $_POST['message'];
				$formcontent = htmlspecialchars("From: $name\nMail: $email\nMessage: $message");
				if (!empty($_POST['url'])) {
					echo "<img alt='No droids.' src='/assets/no_droids.gif' />";
					$url = $_POST['url'];
					mail('matthias@gessinger.de', 'Spam Filter: Bot', "The spam filter caught a bot:\nAt: $url\n$formcontent");
					exit;
				}
				if (strcasecmp($_POST['phone'],'red') != 0) {
					echo "<p>Wrong.</p>";
					echo '<img src="assets/vader.gif" alt="I have a bad feeling about this." />';
					$ans = $_POST['phone'];
					mail('matthias@gessinger.de', 'Spam Filter: Wrong Answer', "Someone answered the test-question with $ans:\n$formcontent");
					exit;
				}
				mail('feedback@mandocreator.com',$subject,$formcontent);
				echo '<img src="assets/Mando-Creator-Success.png" alt="Success. We will see your message soon. Thank you." height="50%" />';
			?>
		</div>
	</body>
</html>
