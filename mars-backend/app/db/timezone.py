import datetime

KST = datetime.timezone(datetime.timedelta(hours=9))


def kst_now() -> datetime.datetime:
    return datetime.datetime.now(KST).replace(tzinfo=None)
