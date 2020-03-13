--
-- Current Database: `vale`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `vale` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `vale`;

--
-- Table structure for table `player`
--

DROP TABLE IF EXISTS `player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `player` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `pwhash` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `player`
--

LOCK TABLES `player` WRITE;
/*!40000 ALTER TABLE `player` DISABLE KEYS */;
/*!40000 ALTER TABLE `player` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playersequence`
--

DROP TABLE IF EXISTS `playersequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `playersequence` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `round_fk` int(11) NOT NULL,
  `player_fk` int(11) NOT NULL,
  `sequenceno` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `player` (`player_fk`),
  KEY `FK_playersequence_round_fk` (`round_fk`),
  CONSTRAINT `FK_playersequence_round_fk` FOREIGN KEY (`round_fk`) REFERENCES `round` (`id`) ON DELETE NO ACTION,
  CONSTRAINT `player` FOREIGN KEY (`player_fk`) REFERENCES `player` (`id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playersequence`
--

LOCK TABLES `playersequence` WRITE;
/*!40000 ALTER TABLE `playersequence` DISABLE KEYS */;
/*!40000 ALTER TABLE `playersequence` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `round`
--

DROP TABLE IF EXISTS `round`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `round` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence` int(11) NOT NULL,
  `session_fk` int(11) DEFAULT NULL,
  `start15` int(11) NOT NULL,
  `start20` int(11) NOT NULL,
  `end15` int(11) NOT NULL,
  `end20` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `session_fk` (`session_fk`),
  CONSTRAINT `session_fk` FOREIGN KEY (`session_fk`) REFERENCES `session` (`id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `round`
--

LOCK TABLES `round` WRITE;
/*!40000 ALTER TABLE `round` DISABLE KEYS */;
/*!40000 ALTER TABLE `round` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `score`
--

DROP TABLE IF EXISTS `score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `score` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `score` int(11) NOT NULL,
  `player_fk` int(11) NOT NULL,
  `round_fk` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_round` (`round_fk`),
  KEY `FK_player` (`player_fk`),
  CONSTRAINT `FK_player` FOREIGN KEY (`player_fk`) REFERENCES `player` (`id`) ON DELETE NO ACTION,
  CONSTRAINT `FK_round` FOREIGN KEY (`round_fk`) REFERENCES `round` (`id`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `score`
--

LOCK TABLES `score` WRITE;
/*!40000 ALTER TABLE `score` DISABLE KEYS */;
/*!40000 ALTER TABLE `score` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `timestamp` datetime NOT NULL,
  `finished` BOOL NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

LOCK TABLES `session` WRITE;
/*!40000 ALTER TABLE `session` DISABLE KEYS */;
/*!40000 ALTER TABLE `session` ENABLE KEYS */;
UNLOCK TABLES;
