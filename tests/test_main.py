from stojanovic_one.main import main

def test_main(capsys):
    main()
    captured = capsys.readouterr()
    assert captured.out == "Hello from Stojanovic-One!\n"