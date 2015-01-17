
datetime=`date +"%Y%m%d%H%M%S"`
content="$datetime"

echo "$content" > $datetime.txt

aws s3api put-object \
 --bucket processdata \
 --key $datetime.txt \
 --body $datetime.txt

rm ./$datetime.txt

