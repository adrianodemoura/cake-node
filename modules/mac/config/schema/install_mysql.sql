#DROP FUNCTION IF EXISTS MASK; // tive que colocar no código

CREATE FUNCTION MASK(val VARCHAR(100), mask VARCHAR(100)) RETURNS VARCHAR(100) DETERMINISTIC
BEGIN
  DECLARE maskared VARCHAR(100) DEFAULT "";
  DECLARE k INT DEFAULT 0;
  DECLARE i INT DEFAULT 0;
  DECLARE tv INT DEFAULT CHAR_LENGTH(VAL);
  DECLARE tm INT DEFAULT CHAR_LENGTH(MASK);
  DECLARE um VARCHAR(20) DEFAULT REPLACE(mask,'#','');
  DECLARE tt INT DEFAULT (tm-char_length(um));
  DECLARE vlrTemp INT default -1; 

  IF CHAR_LENGTH(val) < 2 THEN
    RETURN val;
  END IF;

  IF mask = 'numberBr' THEN
    SET vlrTemp = SUBSTR(val, - (tv - LOCATE('.', val)));

    RETURN CONCAT(REPLACE(FORMAT(val,0),',','.'), ',', vlrTemp);
  END IF;

  WHILE i < CHAR_LENGTH(mask) DO
    SET i = i + 1;
    IF SUBSTRING(mask, i, 1) = '#' THEN
      IF k < CHAR_LENGTH(val) THEN
      SET k = k+1;
      SET maskared = CONCAT(maskared, SUBSTRING(val, k, 1));
    END IF;
  ELSE
    IF i < CHAR_LENGTH(mask) THEN
      SET maskared = CONCAT(maskared, SUBSTRING(mask, i, 1));
          END IF;
      END IF;
  END WHILE;

  RETURN maskared;
END;