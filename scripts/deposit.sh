curl -X POST -H "content-type: application/json" \
-d "{\"address\":\"$1\",\"amount\":$2}" \
http://localhost:8080/api/wallet/notify