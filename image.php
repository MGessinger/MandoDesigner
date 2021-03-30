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
				background: url(assets/fog-small.jpg) no-repeat center;
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
			img {
				height: 50%;
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
					echo "<img src='/assets/no_droids.gif' alt='No droids.' />";
				} else if (strcasecmp($_POST['phone'],'red') != 0) {
					echo '<p>Wrong.</p><img src="assets/vader.gif" alt="The correct answer is \'Red\', Rebel Scum!" />';
				} else {
					mail('feedback@mandocreator.com',$subject,$formcontent);
					echo '<img src="assets/Mando-Creator-Success.png" alt="Success. We will see your message soon. Thank you." />';
				}
			?>
		</div>
	</body>
</html>
